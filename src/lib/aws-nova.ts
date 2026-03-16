import { rateLimitedLLMCall } from './rate-limiter'
import type { MetricsSummary, Alert } from './types'

export interface NovaVoiceConfig {
  accessKeyId: string
  secretAccessKey: string
  region: string
  enabled: boolean
}

export interface NovaConversationMessage {
  id: string
  role: 'user' | 'assistant'
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

  endSession(): void {
    this.activeSession = null
  }

  async processUserMessage(transcript: string): Promise<NovaConversationMessage> {
    if (!this.activeSession) {
      throw new Error('No active session')
    }

    const userMessage: NovaConversationMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: transcript,
      timestamp: Date.now()
    }

    this.activeSession.messages.push(userMessage)
    this.activeSession.lastActiveAt = Date.now()

    const criticalAlerts = this.activeSession.context.alerts?.filter(a => a.severity === 'critical') || []
    const warningAlerts = this.activeSession.context.alerts?.filter(a => a.severity === 'warning') || []
    
    const prompt = this.buildPrompt(
      transcript,
      this.activeSession.context.summary,
      criticalAlerts.length,
      warningAlerts.length
    )

    const responseText = await this.generateResponse(prompt, criticalAlerts.length)

    const assistantMessage: NovaConversationMessage = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: responseText,
      timestamp: Date.now()
    }

    this.activeSession.messages.push(assistantMessage)
    this.activeSession.lastActiveAt = Date.now()

    return assistantMessage
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

  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.audioChunks = []
        
        this.blobToBase64(audioBlob).then(resolve).catch(reject)
      }

      this.mediaRecorder.stop()
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
    })
  }

  private buildPrompt(
    userQuery: string,
    summary: MetricsSummary | undefined,
    criticalCount: number,
    warningCount: number
  ): string {
    const alertDetails = criticalCount > 0 || warningCount > 0
      ? `- Critical: ${criticalCount}\n- Warning: ${warningCount}`
      : 'No active alerts'

    return `You are an AI observability assistant monitoring AWS-based LLM systems.

Current System Status:
- Total Requests: ${summary?.totalRequests || 0}
- Average Latency: ${summary?.avgLatency || 0}ms
- P99 Latency: ${summary?.p99Latency || 0}ms
- Error Rate: ${summary?.errorRate || 0}%
- Total Cost: $${summary?.totalCost || 0}
- Active Critical Alerts: ${criticalCount}
- Active Warning Alerts: ${warningCount}

Alert Status:
${alertDetails}

User Query: "${userQuery}"

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
