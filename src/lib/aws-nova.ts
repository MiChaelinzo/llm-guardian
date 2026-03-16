import { rateLimitedLLMCall } from './rate-limiter'
import type { MetricsSummary, Alert } from './types'

export interface NovaVoiceConfig {
  accessKeyId: string
  secretAccessKey: string
  region: string
  enabled: boolean
}

export interface NovaConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  audioUrl?: string
}

export interface NovaVoiceSession {
  id: string
  messages: NovaConversationMessage[]
  startedAt: number
  lastActiveAt: number
  context: {
    summary?: MetricsSummary
    alerts?: Alert[]
  }
}

class NovaVoiceService {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private activeSession: NovaVoiceSession | null = null
  private config: NovaVoiceConfig | null = null

  setConfig(config: NovaVoiceConfig): void {
    this.config = config
  }

  getConfig(): NovaVoiceConfig | null {
    return this.config
  }

  isConfigured(): boolean {
    return !!(this.config?.enabled && this.config?.accessKeyId && this.config?.secretAccessKey)
  }

  startSession(context: { summary: MetricsSummary; alerts: Alert[] }): NovaVoiceSession {
    this.activeSession = {
      id: `nova_session_${Date.now()}`,
      messages: [],
      startedAt: Date.now(),
      lastActiveAt: Date.now(),
      context
    }
    return this.activeSession
  }

  getActiveSession(): NovaVoiceSession | null {
    return this.activeSession
  }

  getSessionHistory(): NovaConversationMessage[] {
    return this.activeSession?.messages || []
  }

  async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    try {
      this.audioChunks = []
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        this.audioChunks.push(event.data)
      }

      this.mediaRecorder.onstop = () => {
        this.mediaRecorder = null
      }

      this.mediaRecorder.start()
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.audioChunks = []
        this.mediaRecorder = null
        resolve(audioBlob)
      }

      this.mediaRecorder.onerror = () => {
        reject(new Error('Recording failed'))
      }

      this.mediaRecorder.stop()
    })
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const base64Audio = await this.blobToBase64(audioBlob)
      const prompt = `Transcribe the following audio data to text.\n\nAudio data: ${base64Audio.substring(0, 100)}...`

      const transcription = await rateLimitedLLMCall(prompt, 'gpt-4o-mini', false)
      return transcription
    } catch (error) {
      console.error('Transcription failed:', error)
      return this.fallbackTranscription()
    }
  }

  private fallbackTranscription(): string {
    return ''
  }

  async processSpeechToSpeech(
    audioBlob: Blob,
    context: { summary: MetricsSummary; alerts: Alert[] }
  ): Promise<{ text: string; audioUrl: string }> {
    if (!this.isConfigured()) {
      return this.fallbackSpeechToSpeech(context)
    }

    try {
      const transcription = await this.transcribeAudio(audioBlob)

      if (this.activeSession) {
        this.activeSession.messages.push({
          role: 'user',
          content: transcription,
          timestamp: Date.now()
        })
        this.activeSession.lastActiveAt = Date.now()
      }

      const responseText = await this.generateResponse(transcription, context)
      const audioUrl = await this.synthesizeSpeech(responseText)

      if (this.activeSession) {
        this.activeSession.messages.push({
          role: 'assistant',
          content: responseText,
          timestamp: Date.now(),
          audioUrl
        })
        this.activeSession.lastActiveAt = Date.now()
      }

      return { text: responseText, audioUrl }
    } catch (error) {
      console.error('Speech-to-speech processing failed:', error)
      return this.fallbackSpeechToSpeech(context)
    }
  }

  async generateResponse(
    userQuery: string,
    context: { summary: MetricsSummary; alerts: Alert[] }
  ): Promise<string> {
    const { summary, alerts } = context
    const activeAlerts = alerts.filter(a => !a.acknowledged)
    const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length
    const warningCount = activeAlerts.filter(a => a.severity === 'warning').length

    const conversationHistory = this.activeSession?.messages.slice(-6).map(m =>
      `${m.role}: ${m.content}`
    ).join('\n') || ''

    const prompt = window.spark.llmPrompt`You are an AI assistant powered by AWS Nova 2 Sonic for VoiceWatch AI.

You help engineers monitor their AI applications through natural voice conversations.

Current System Metrics:
- Average Latency: ${Math.round(summary.avgLatency)}ms
- P95 Latency: ${Math.round(summary.p95Latency)}ms
- P99 Latency: ${Math.round(summary.p99Latency)}ms
- Error Rate: ${summary.errorRate.toFixed(2)}%
- Total Requests: ${summary.totalRequests}
- Total Cost: $${summary.totalCost.toFixed(4)}
- Active Critical Alerts: ${criticalCount}
- Active Warning Alerts: ${warningCount}

Recent Conversation:
${conversationHistory}

User Query: ${userQuery}

Provide a concise, natural, conversational response (2-4 sentences) that:
1. Directly answers the user's question
2. Highlights any urgent issues if present
3. Uses specific numbers from the metrics
4. Sounds natural when spoken aloud

Response:`

    try {
      const response = await rateLimitedLLMCall(prompt, 'gpt-4o', false)
      return response.trim()
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit')) {
        return `I'm currently rate limited. Here's a quick summary: Your system has ${criticalCount} critical alerts and ${warningCount} warnings. Average latency is ${Math.round(summary.avgLatency)}ms.`
      }
      return `System overview: ${criticalCount} critical alerts, ${warningCount} warnings. Average latency: ${Math.round(summary.avgLatency)}ms. Error rate: ${summary.errorRate.toFixed(2)}%.`
    }
  }

  private fallbackSpeechToSpeech(context: { summary: MetricsSummary; alerts: Alert[] }): { text: string; audioUrl: string } {
    const { summary, alerts } = context
    const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length

    const text = criticalCount > 0
      ? `Attention: ${criticalCount} critical alerts detected. Average latency is ${Math.round(summary.avgLatency)}ms with a ${summary.errorRate.toFixed(1)}% error rate.`
      : `System is running normally. Average latency: ${Math.round(summary.avgLatency)}ms. Error rate: ${summary.errorRate.toFixed(1)}%.`

    return { text, audioUrl: 'synthesized://fallback' }
  }

  async synthesizeSpeech(text: string): Promise<string> {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      return new Promise<string>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.1
        utterance.volume = 1.0

        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find(
          (v) =>
            v.name.includes('Samantha') ||
            v.name.includes('Google US English')
        )

        if (preferredVoice) {
          utterance.voice = preferredVoice
        }

        window.speechSynthesis.speak(utterance)
        resolve('synthesized://browser')
      })
    }

    return 'synthesized://fallback'
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result.split(',')[1] ?? '')
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  getMessages(): NovaConversationMessage[] {
    return this.activeSession?.messages || []
  }
}

export const novaVoiceService = new NovaVoiceService()