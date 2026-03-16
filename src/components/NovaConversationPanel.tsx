import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Lightning, Waveform, User } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { NovaConversationMessage } from '@/lib/aws-nova'

interface NovaConversationPanelProps {
  messages: NovaConversationMessage[]
  isActive: boolean
}

export function NovaConversationPanel({ messages, isActive }: NovaConversationPanelProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  const formatDuration = (start: number, end: number) => {
    const duration = end - start
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(1)}s`
  }

  const conversationPairs = []
  for (let i = 0; i < messages.length; i += 2) {
    if (messages[i] && messages[i + 1]) {
      conversationPairs.push({
        user: messages[i],
        assistant: messages[i + 1],
        duration: formatDuration(messages[i].timestamp, messages[i + 1].timestamp)
      })
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center">
              <Lightning size={20} weight="fill" className="text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Nova Conversation History
                {isActive && (
                  <Badge variant="outline" className="gap-1 border-success/50 bg-success/10 text-success">
                    <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Real-time speech-to-speech interactions
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">{messages.length}</div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
              <Waveform size={32} weight="fill" className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Click the Nova voice button to start a speech-to-speech conversation about your system metrics and alerts.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {conversationPairs.map((pair, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-3 pb-6 border-b border-border last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={16} weight="fill" className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">You</span>
                        <span className="text-xs text-muted-foreground">{formatTime(pair.user.timestamp)}</span>
                      </div>
                      <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-3">
                        <p className="text-sm leading-relaxed">{pair.user.content}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1">
                      <Lightning size={16} weight="fill" className="text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">Nova AI</span>
                        <span className="text-xs text-muted-foreground">{formatTime(pair.assistant.timestamp)}</span>
                        <Badge variant="outline" className="text-xs h-5 border-primary/30 bg-primary/10">
                          {pair.duration}
                        </Badge>
                      </div>
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-3">
                        <p className="text-sm leading-relaxed">{pair.assistant.content}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
