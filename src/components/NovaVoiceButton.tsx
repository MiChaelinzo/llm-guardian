import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Lightning, Circle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { novaVoiceService } from '@/lib/aws-nova'
import type { MetricsSummary, Alert } from '@/lib/types'

interface NovaVoiceButtonProps {
  summary: MetricsSummary
  alerts: Alert[]
  isConfigured: boolean
}

export function NovaVoiceButton({ summary, alerts, isConfigured }: NovaVoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleVoiceInteraction = async () => {
    if (isProcessing) return

    if (!isConfigured) {
      toast.error('AWS Nova is not configured. Please configure it in Settings.')
      return
    }

    if (!isRecording) {
      try {
        await novaVoiceService.startRecording()
        setIsRecording(true)
        toast.success('Listening... Speak now')
      } catch (error) {
        console.error('Failed to start recording:', error)
        toast.error('Failed to start recording. Please check microphone permissions.')
      }
    } else {
      try {
        setIsProcessing(true)
        await novaVoiceService.stopRecording()
        setIsRecording(false)

        if (!novaVoiceService.getActiveSession()) {
          novaVoiceService.startSession({ summary, alerts })
        }

        const transcript = 'What is the current system status?'
        const response = await novaVoiceService.processUserMessage(transcript)

        await novaVoiceService.synthesizeSpeech(response.content)
        toast.success('Response generated')
      } catch (error) {
        console.error('Voice interaction failed:', error)
        toast.error('Voice interaction failed. Please try again.')
      } finally {
        setIsProcessing(false)
      }
    }
  }

  return (
    <Button
      onClick={handleVoiceInteraction}
      disabled={isProcessing}
      variant={isRecording ? 'default' : 'outline'}
      size="sm"
      className={`gap-2 ${
        isRecording
          ? 'bg-gradient-to-r from-primary via-accent to-primary animate-pulse'
          : ''
      }`}
    >
      {isProcessing ? (
        <>
          <Circle size={16} weight="fill" className="animate-spin" />
          Processing...
        </>
      ) : isRecording ? (
        <>
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          Recording...
        </>
      ) : (
        <>
          <Lightning size={16} weight="fill" />
          Nova AI
        </>
      )}
    </Button>
  )
}
