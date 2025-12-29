import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PaperPlaneRight, Users, Info, Lightning } from '@phosphor-icons/react'
import { useIncidentChat } from '@/hooks/use-incident-chat'
import { formatDistanceToNow } from 'date-fns'
import type { Incident } from '@/lib/types'

interface IncidentChatProps {
  incident: Incident
  currentUserId: string
  currentUserName: string
  currentUserAvatar: string
}

export function IncidentChat({ incident, currentUserId, currentUserName, currentUserAvatar }: IncidentChatProps) {
  const [messageInput, setMessageInput] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    channel,
    sendMessage,
    sendSystemMessage,
    markAsRead,
  } = useIncidentChat(incident.id, currentUserId, currentUserName, currentUserAvatar)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    markAsRead()
  }, [markAsRead])

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    sendMessage(messageInput.trim())
    setMessageInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Info size={16} weight="fill" className="text-accent" />
      case 'action':
        return <Lightning size={16} weight="fill" className="text-warning" />
      default:
        return null
    }
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} weight="bold" className="text-primary" />
              Incident Chat
            </CardTitle>
            <CardDescription className="mt-1">
              Team communication for {incident.title}
            </CardDescription>
          </div>
          {channel && channel.participantIds.length > 0 && (
            <Badge variant="secondary" className="gap-1.5">
              <Users size={14} />
              {channel.participantIds.length} participant{channel.participantIds.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => {
                const isCurrentUser = message.userId === currentUserId
                const showAvatar = index === 0 || messages[index - 1]?.userId !== message.userId
                const isSystem = message.type === 'system'
                const isAction = message.type === 'action'

                if (isSystem || isAction) {
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
                    >
                      {getMessageIcon(message.type)}
                      <span>{message.content}</span>
                      <span className="text-[10px]">
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </span>
                    </motion.div>
                  )
                }

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {showAvatar ? (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={message.userAvatar} alt={message.userName} />
                        <AvatarFallback className="text-xs">
                          {getInitials(message.userName)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 flex-shrink-0" />
                    )}

                    <div className={`flex flex-col gap-1 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                      {showAvatar && (
                        <div className={`flex items-center gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="text-xs font-medium">{message.userName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              size="icon"
              className="flex-shrink-0"
            >
              <PaperPlaneRight size={18} weight="fill" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
