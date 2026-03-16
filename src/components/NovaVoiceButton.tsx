import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Microphone, MicrophoneSlash, Waveform, Lightning } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { novaVoiceService, type NovaConversationMessage } from '@/lib/aws-nova'
import type { MetricsSummary, Alert } from '@/lib/types'
import { toast } from 'sonner'

interface NovaVoiceButtonProps {
  summary: MetricsSummary
  alerts: Alert[]
  isConfigured: boolean
}

export function NovaVoiceButton({ summary, alerts, isConfigured }: NovaVoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConversation, setShowConversation] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<NovaConversationMessage[]>([])
  const [audioLevel, setAudioLevel] = useState(0)

  useEffect(() => {
    if (!novaVoiceService.getActiveSession()) {
      novaVoiceService.startSession({ summary, alerts })
    }
  }, [summary, alerts])

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100)
      }, 100)
      return () => clearInterval(interval)
    } else {
      setAudioLevel(0)
    }
  }, [isRecording])

  const handleStartRecording = async () => {
    try {
      await novaVoiceService.startRecording()
      setIsRecording(true)
      toast.success('Listening... Speak your query')
    } catch (error) {
      toast.error('Microphone access denied')
      console.error('Recording error:', error)
    }
  }

  const handleStopRecording = async () => {
    try {
      setIsRecording(false)
      setIsProcessing(true)
      
      const audioBlob = await novaVoiceService.stopRecording()
      
      const response = await novaVoiceService.processSpeechToSpeech(audioBlob, {
        summary,
        alerts
      })

      setConversationHistory(novaVoiceService.getSessionHistory())
      setShowConversation(true)
      
      toast.success('Response generated', {
        description: response.text.substring(0, 100) + (response.text.length > 100 ? '...' : '')
      })
    } catch (error) {
      toast.error('Processing failed')
      console.error('Processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Button
          size="lg"
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isProcessing || !isConfigured}
          className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 disabled:opacity-50 shadow-lg shadow-primary/30"
          title={!isConfigured ? 'Configure AWS Nova credentials in Settings' : 'Click to speak with Nova AI'}
        >
          {isProcessing ? (
            <Waveform className="relative z-10 animate-pulse" size={28} weight="fill" />
          ) : isRecording ? (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-accent"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.2, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-primary"
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <MicrophoneSlash className="relative z-10" size={28} weight="fill" />
            </>
          ) : (
            <Microphone size={28} weight="fill" />
          )}
        </Button>
        
        {isRecording && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-gradient-to-t from-accent to-primary rounded-full"
                animate={{
                  height: [4, (audioLevel / 100) * 24 + 4, 4]
                }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.05,
                  repeat: Infinity
                }}
              />
            ))}
          </div>
        )}

        {isConfigured && !isRecording && !isProcessing && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="w-3 h-3 bg-success rounded-full border-2 border-background" />
          </motion.div>
        )}
      </div>

      {conversationHistory.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConversation(!showConversation)}
          className="gap-2"
        >
          <Lightning size={16} weight="fill" />
          Conversation ({conversationHistory.length})
        </Button>
      )}

      <AnimatePresence>
        {showConversation && conversationHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed top-20 right-6 z-50 w-96"
          >
            <Card className="p-0 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-lg">
              <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Lightning size={16} weight="fill" className="text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">AWS Nova 2 Sonic</h3>
                      <p className="text-xs text-muted-foreground">Speech-to-Speech AI</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConversation(false)}
                    className="h-7 w-7 p-0"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-96 p-4">
                <div className="space-y-4">
                  {conversationHistory.map((message, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {message.role === 'assistant' && (
                            <Badge variant="outline" className="text-xs gap-1 border-primary/30 bg-primary/10">
                              <Lightning size={10} weight="fill" />
                              Nova
                            </Badge>
                          )}
                          {message.role === 'user' && (
                            <Badge variant="outline" className="text-xs border-accent/30 bg-accent/10">
                              You
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30'
                              : 'bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-border bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Real-time Speech AI</span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
