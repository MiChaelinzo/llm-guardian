import { rateLimitedLLMCall } from './rate-limiter'


  region: string
}
export interface NovaConv
  region: string
  audioUrl?: strin
}

  startedAt: number
  context: {
  content: string
  timestamp: number
  audioUrl?: string
 

export interface NovaVoiceSession {
  id: string
  messages: NovaConversationMessage[]
  startedAt: number
  lastActiveAt: number
  context: {
    summary?: MetricsSummary
    alerts?: Alert[]
  }
 

class NovaVoiceService {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private activeSession: NovaVoiceSession | null = null
  private config: NovaVoiceConfig | null = null

  setConfig(config: NovaVoiceConfig): void {
    this.config = config


  getConfig(): NovaVoiceConfig | null {
    return this.config
   

  isConfigured(): boolean {
    return this.config !== null && this.config.enabled && 
           !!this.config.accessKeyId && !!this.config.secretAccessKey
   

  startSession(context: { summary: MetricsSummary; alerts: Alert[] }): NovaVoiceSession {
    this.activeSession = {
      id: `nova_session_${Date.now()}`,
      messages: [],
      startedAt: Date.now(),
      lastActiveAt: Date.now(),
      context
    }
    return this.activeSession
   

          role: 'user',
    return this.activeSession
   

      console.error('Transcription failed:', error
    return this.activeSession?.messages || []


  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      this.mediaRecorder = new MediaRecorder(stream)
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
      con
      }

      this.mediaRecorder.start()
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
   

  private buildPrompt(
    return new Promise((resolve, reject) => {
    warningCount: number,
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
- Active Critical Alerts: ${criticalCount}
        this.audioChunks = []
${alertDetails || 'No acti
Provide

  }
  private async generateResponse(prompt: stri
      c

    }

   

        const voices = window.speechSynthesis.getVoices()
         
            v.name.includes('Google US English')



      
    }
    return 'synthesized://fallback'

    return new Promise((resolve, 

        co
      }
      
      }
      reader.readAsDa
  }
  getMessages(): NovaConversationMessage[
  }

































































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
