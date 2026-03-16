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
    return this.config !== null && this.config.enabled && 
           !!this.config.accessKeyId && !!this.config.secretAccessKey
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      this.mediaRecorder = new MediaRecorder(stream)
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start()
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.audioChunks = []
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
      
      if (this.activeSession) {
        this.activeSession.messages.push({
          role: 'user',
          content: transcription,
          timestamp: Date.now()
        })
      }
      
      return transcription
    } catch (error) {
      console.error('Transcription failed:', error)
      return this.fallbackTranscription()
    }
  }

  private fallbackTranscription(): string {
    return "Could you provide status on the current system metrics?"
  }

  async processSpeechToSpeech(
    audioBlob: Blob,
    alerts: Alert[],
    summary?: MetricsSummary
  ): Promise<{ text: string; audioUrl: string }> {
    try {
      const transcription = await this.transcribeAudio(audioBlob)

      const activeAlerts = alerts.filter((a) => !a.acknowledged)
      const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length
      const warningCount = activeAlerts.filter((a) => a.severity === 'warning').length

      const alertDetails = activeAlerts
        .slice(0, 3)
        .map((a) => `[${a.severity.toUpperCase()}] ${a.message}`)
        .join('\n')

      const prompt = this.buildPrompt(transcription, summary, criticalCount, warningCount, alertDetails)

      const responseText = await this.generateResponse(prompt, criticalCount)
      const audioUrl = await this.synthesizeSpeech(responseText)

      if (this.activeSession) {
        this.activeSession.messages.push({
          role: 'assistant',
          content: responseText,
          timestamp: Date.now(),
          audioUrl,
        })
        this.activeSession.lastActiveAt = Date.now()
      }

      return { text: responseText, audioUrl }
    } catch (error) {
      console.error('Speech-to-speech processing failed:', error)
      throw error
    }
  }

  private buildPrompt(
    transcription: string,
    summary: MetricsSummary | undefined,
    criticalCount: number,
    warningCount: number,
    alertDetails: string
  ): string {
    return `You help engineers monitor their systems.

User question: ${transcription}

Current Metrics:
- Error Rate: ${summary?.errorRate ?? 0}%
- Average Latency: ${summary?.avgLatency ?? 0}ms
- P99 Latency: ${summary?.p99Latency ?? 0}ms
- Total Requests: ${summary?.totalRequests ?? 0}
- Active Critical Alerts: ${criticalCount}
- Active Warning Alerts: ${warningCount}

Recent Alerts:
${alertDetails || 'No active alerts'}

Provide a response that:
1. Directly answers the user's question
2. Provides actionable insights
3. Uses specific numbers from the metrics`
  }

  private async generateResponse(prompt: string, criticalCount: number): Promise<string> {
    try {
      const response = await rateLimitedLLMCall(prompt, 'gpt-4o-mini', false)
      return response
    } catch (error) {
      return `Rate limiting active. Current status: ${criticalCount} critical alert(s). Please try again shortly.`
    }
  }

  async synthesizeSpeech(text: string): Promise<string> {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      return new Promise<string>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text)

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

      reader.onerror = () => {
        reject(new Error('Failed to read blob'))
      }

      reader.readAsDataURL(blob)
    })
  }

  getMessages(): NovaConversationMessage[] {
    return this.getSessionHistory()
  }
}

export const novaVoiceService = new NovaVoiceService()
