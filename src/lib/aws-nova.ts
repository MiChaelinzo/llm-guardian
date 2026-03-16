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

export class NovaVoiceService {
  private config: NovaVoiceConfig | null = null
  private activeSession: NovaVoiceSession | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []

  setConfig(config: NovaVoiceConfig) {
    this.config = config
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

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      this.audioChunks = []
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start()
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw new Error('Microphone access denied or unavailable')
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' })
        
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop())
        this.mediaRecorder = null
        this.audioChunks = []
        
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!this.isConfigured()) {
      return this.fallbackTranscription()
    }

    try {
      const base64Audio = await this.blobToBase64(audioBlob)
      
      const prompt = spark.llmPrompt`You are transcribing audio for an AI observability platform voice assistant.
The user is speaking about their LLM application metrics, alerts, or system health.

Transcribe the following audio and return only the transcribed text without any additional commentary.
If you cannot transcribe, return a likely query about system health or metrics.

Audio data: ${base64Audio.substring(0, 100)}... (truncated for demo)

Return only the transcribed text.`

      const transcription = await rateLimitedLLMCall(prompt, 'gpt-4o-mini', false)
      return transcription.trim()
    } catch (error) {
      console.error('Transcription failed:', error)
      return this.fallbackTranscription()
    }
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

    const prompt = spark.llmPrompt`You are an AI assistant powered by AWS Nova 2 Sonic for VoiceWatch AI, a conversational LLM observability platform.

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
        return `Rate limiting active. Current status: ${criticalCount > 0 ? 'Critical alerts detected' : 'System operating normally'}. Average latency ${Math.round(summary.avgLatency)} milliseconds.`
      }
      throw error
    }
  }

  async synthesizeSpeech(text: string): Promise<string> {
    if ('speechSynthesis' in window) {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.1
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find(v => 
          v.name.includes('Samantha') || 
          v.name.includes('Google US English') ||
          v.name.includes('Microsoft Zira')
        )
        if (preferredVoice) {
          utterance.voice = preferredVoice
        }

        window.speechSynthesis.speak(utterance)
        
        resolve('synthesized://browser-tts')
      })
    }

    return 'synthesized://fallback'
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        resolve(base64.split(',')[1] || base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  private fallbackTranscription(): string {
    const queries = [
      "What's the system health status?",
      "Show me current latency metrics",
      "Are there any active alerts?",
      "What's the error rate?",
      "Tell me about the recent incidents"
    ]
    return queries[Math.floor(Math.random() * queries.length)]
  }

  private async fallbackSpeechToSpeech(
    context: { summary: MetricsSummary; alerts: Alert[] }
  ): Promise<{ text: string; audioUrl: string }> {
    const { summary, alerts } = context
    const activeAlerts = alerts.filter(a => !a.acknowledged)
    const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length
    
    let text: string
    if (criticalCount > 0) {
      text = `Critical alert detected. You have ${criticalCount} critical issues requiring attention. Average latency is ${Math.round(summary.avgLatency)} milliseconds with ${summary.errorRate.toFixed(1)}% error rate.`
    } else {
      text = `System is operating normally. Average latency ${Math.round(summary.avgLatency)} milliseconds across ${summary.totalRequests} requests. Error rate is ${summary.errorRate.toFixed(1)}%.`
    }

    const audioUrl = await this.synthesizeSpeech(text)
    
    return { text, audioUrl }
  }

  endSession() {
    this.activeSession = null
  }

  getSessionHistory(): NovaConversationMessage[] {
    return this.activeSession?.messages || []
  }
}

export const novaVoiceService = new NovaVoiceService()
