import { useState, useEffect } from 'react'
import { WebSocketManager, CollaborationEvent, CollaborationUser } from '@/lib/websocket'

let wsManager: WebSocketManager | null = null

export function useCollaboration(userId: string) {
  const [users, setUsers] = useState<Map<string, CollaborationUser>>(new Map())
  const [events, setEvents] = useState<CollaborationEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!wsManager) {
      wsManager = new WebSocketManager(userId, true)
    }

    const handleEvent = (event: CollaborationEvent) => {
      setEvents((prev) => [...prev.slice(-99), event])

      if (event.type === 'user_joined') {
        setUsers((prev) => {
          const next = new Map(prev)
          next.set(event.userId, {
            id: event.userId,
            name: event.userName,
            avatar: event.userAvatar,
            status: 'active',
            lastSeen: event.timestamp,
          })
          return next
        })
      } else if (event.type === 'user_left') {
        setUsers((prev) => {
          const next = new Map(prev)
          next.delete(event.userId)
          return next
        })
      } else if (event.type === 'cursor_move') {
        setUsers((prev) => {
          const next = new Map(prev)
          const user = next.get(event.userId)
          if (user) {
            next.set(event.userId, {
              ...user,
              cursorPosition: { x: event.x, y: event.y },
              lastSeen: event.timestamp,
            })
          }
          return next
        })
      } else if (event.type === 'presence_update') {
        setUsers((prev) => {
          const next = new Map(prev)
          const user = next.get(event.userId)
          if (user) {
            next.set(event.userId, {
              ...user,
              status: event.status,
              lastSeen: event.timestamp,
            })
          }
          return next
        })
      } else {
        setUsers((prev) => {
          const next = new Map(prev)
          const user = next.get(event.userId)
          if (user) {
            next.set(event.userId, {
              ...user,
              lastSeen: event.timestamp,
            })
          }
          return next
        })
      }
    }

    wsManager.on('*', handleEvent)
    setIsConnected(true)

    return () => {
    }
  }, [userId])

  const broadcastEvent = (event: Partial<CollaborationEvent> & { type: string }) => {
    if (wsManager && event.type) {
      wsManager.send(event as CollaborationEvent)
    }
  }

  const updateCursor = (x: number, y: number) => {
    broadcastEvent({
      type: 'cursor_move',
      userId,
      x,
      y,
      timestamp: Date.now(),
    })
  }

  const updatePresence = (status: 'active' | 'idle' | 'away') => {
    broadcastEvent({
      type: 'presence_update',
      userId,
      status,
      timestamp: Date.now(),
    })
  }

  return {
    users: Array.from(users.values()),
    events,
    isConnected,
    broadcastEvent,
    updateCursor,
    updatePresence,
  }
}
