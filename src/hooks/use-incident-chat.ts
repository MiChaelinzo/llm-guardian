import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { useCollaboration } from './use-collaboration'
import type { ChatMessage, ChatChannel } from '@/lib/types'

export function useIncidentChat(incidentId: string, userId: string, userName: string, userAvatar: string) {
  const [messages, setMessages] = useKV<ChatMessage[]>(`chat-messages-${incidentId}`, [])
  const [channel, setChannel] = useKV<ChatChannel | null>(`chat-channel-${incidentId}`, null)
  const [isTyping, setIsTyping] = useState<Set<string>>(new Set())
  const { broadcastEvent } = useCollaboration(userId)

  useEffect(() => {
    if (!channel) {
      const newChannel: ChatChannel = {
        id: `channel_${incidentId}`,
        incidentId,
        name: `Incident ${incidentId.split('_')[1]}`,
        createdAt: Date.now(),
        participantIds: [userId],
      }
      setChannel(newChannel)
    } else if (!channel.participantIds.includes(userId)) {
      setChannel((current) => {
        if (!current) return null
        return {
          ...current,
          participantIds: [...current.participantIds, userId],
        }
      })
    }
  }, [incidentId, userId, channel, setChannel])

  const sendMessage = useCallback((content: string, type: 'message' | 'system' | 'action' = 'message', metadata?: ChatMessage['metadata']) => {
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      incidentId,
      userId,
      userName,
      userAvatar,
      content,
      timestamp: Date.now(),
      type,
      metadata,
    }

    setMessages((current) => [...(current || []), message])
    
    setChannel((current) => {
      if (!current) return null
      return {
        ...current,
        lastMessageAt: Date.now(),
      }
    })

    broadcastEvent({
      type: 'chat_message',
      userId,
      incidentId,
      message: content,
      timestamp: Date.now(),
    })

    return message
  }, [incidentId, userId, userName, userAvatar, setMessages, setChannel, broadcastEvent])

  const sendSystemMessage = useCallback((content: string, metadata?: ChatMessage['metadata']) => {
    return sendMessage(content, 'system', metadata)
  }, [sendMessage])

  const sendActionMessage = useCallback((action: string, relatedAlertId?: string) => {
    return sendMessage(action, 'action', { action, relatedAlertId })
  }, [sendMessage])

  const markAsRead = useCallback(() => {
    setChannel((current) => {
      if (!current) return null
      return {
        ...current,
        unreadCount: 0,
      }
    })
  }, [setChannel])

  const getUnreadCount = useCallback(() => {
    return channel?.unreadCount || 0
  }, [channel])

  return {
    messages: messages || [],
    channel,
    sendMessage,
    sendSystemMessage,
    sendActionMessage,
    markAsRead,
    getUnreadCount,
    isTyping: Array.from(isTyping),
  }
}
