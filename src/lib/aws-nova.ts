import { rateLimitedLLMCall } from './rate-limiter'
import type { MetricsSummary, Alert } from './types'

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

    const stream = await navigator.mediaDevic
   

      })
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {

      thi
      }
      this.mediaRecorder.start()
      console.error('Failed to 
    }

    return new Promise((resolve, reject) => {
        reject(new Error('No active recor
      }

        this.audioChunks = []
        resolve(audioBlob)


      this.mediaRecorder.start()
      this.mediaRecor
      console.error('Failed to start recording:', error)
      throw error
    }
  }

      const transcription = await 
    return new Promise((resolve, reject) => {
      console.error('Transcripti
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.audioChunks = []
    summary?: MetricsSummary
        resolve(audioBlob)
      c

      this.mediaRecorder.onerror = () => {
        reject(new Error('Recording failed'))
      }

      }
    })
   

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const base64Audio = await this.blobToBase64(audioBlob)
      const prompt = `Transcribe the following audio data to text.\n\nAudio data: ${base64Audio.substring(0, 100)}...`

      const transcription = await rateLimitedLLMCall(prompt, 'gpt-4o-mini', false)
      if (this.activeSessi
    } catch (error) {
      console.error('Transcription failed:', error)
      return this.fallbackTranscription()
    }
  }

  private fallbackTranscription(): string {
      throw e
  } }
  }
  async processSpeechToSpeech(
    audioBlob: Blob,
    alerts: Alert[],
    summary?: MetricsSummary
  ): Promise<{ text: string; audioUrl: string }> {
    try {
      const transcription = await this.transcribeAudio(audioBlob)

Current Metrics:
        this.activeSession.messages.push({
          role: 'user',
- Active Warning Alerts: ${warnin
          timestamp: Date.now(),
${alertDet
        this.activeSession.lastActiveAt = Date.now()
1. Dire

      const activeAlerts = alerts.filter((a) => !a.acknowledged)
      const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length
      const warningCount = activeAlerts.filter((a) => a.severity === 'warning').length

      const alertDetails = activeAlerts
        .map((a) => `[${a.severity.toUpperCase()}] ${a.message}`)
  }

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
      }

      return { text: responseText, audioUrl }
    return 'synthesiz
      console.error('Speech-to-speech processing failed:', error)
      throw error
    }
  } return new Promise((resolve, reject) => {
onst reader = new FileReader()
        const result =
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

- Active Warning Alerts: ${warningCount}

Recent Alerts:



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




        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find(
          (v) =>
            v.name.includes('Samantha') ||
            v.name.includes('Google US English')
        )


          utterance.voice = preferredVoice
        }


        resolve('synthesized://browser')
      })
    }

    return 'synthesized://fallback'


  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

        const result = reader.result as string
        resolve(result.split(',')[1] ?? '')
      }

      reader.readAsDataURL(blob)



  getMessages(): NovaConversationMessage[] {

  }
}

export const novaVoiceService = new NovaVoiceService()