export type CollaborationEvent = 
  | { type: 'user_joined'; userId: string; userName: string; userAvatar: string; timestamp: number }
  | { type: 'user_left'; userId: string; timestamp: number }
  | { type: 'cursor_move'; userId: string; x: number; y: number; timestamp: number }
  | { type: 'alert_acknowledged'; userId: string; alertId: string; timestamp: number }
  | { type: 'rule_created'; userId: string; ruleName: string; timestamp: number }
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number }
  | { type: 'metric_viewed'; userId: string; metricType: string; timestamp: number }
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timestamp: number }
  | { type: 'presence_update'; userId: string; status: 'active' | 'idle' | 'away'; timestamp: number }

export interface CollaborationUser {
  id: string
  name: string
  avatar: string
  status: 'active' | 'idle' | 'away'
  lastSeen: number
  cursorPosition?: { x: number; y: number }
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: number | null = null
  private userId: string
  private eventHandlers: Map<string, Set<(event: CollaborationEvent) => void>> = new Map()
  private isSimulated: boolean = true

  constructor(userId: string, useSimulation: boolean = true) {
    this.userId = userId
    this.isSimulated = useSimulation
    
    if (this.isSimulated) {
      this.startSimulation()
    }
  }

  connect(url?: string) {
    if (this.isSimulated) return

    try {
      this.ws = new WebSocket(url || 'wss://voicewatch.example.com/ws')

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.send({ type: 'user_joined', userId: this.userId, userName: '', userAvatar: '', timestamp: Date.now() })
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as CollaborationEvent
          this.handleEvent(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.stopHeartbeat()
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error)
    }
  }

  private startSimulation() {
    const simulatedUsers = [
      { id: 'user_1', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
      { id: 'user_2', name: 'Marcus Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
      { id: 'user_3', name: 'Emily Watson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
    ]

    const actions = [
      'acknowledged an alert',
      'created a detection rule',
      'resolved an incident',
      'updated monitoring thresholds',
      'viewed performance metrics',
      'added a comment',
      'configured webhooks',
      'exported a report',
    ]

    setInterval(() => {
      const user = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)]
      const action = actions[Math.floor(Math.random() * actions.length)]
      
      const eventTypes: CollaborationEvent['type'][] = [
        'alert_acknowledged',
        'rule_created',
        'rule_updated',
        'incident_resolved',
        'metric_viewed',
        'comment_added',
      ]

      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

      let event: CollaborationEvent

      switch (eventType) {
        case 'alert_acknowledged':
          event = {
            type: 'alert_acknowledged',
            userId: user.id,
            alertId: `alert_${Date.now()}`,
            timestamp: Date.now(),
          }
          break
        case 'rule_created':
          event = {
            type: 'rule_created',
            userId: user.id,
            ruleName: 'High Latency Alert',
            timestamp: Date.now(),
          }
          break
        case 'rule_updated':
          event = {
            type: 'rule_updated',
            userId: user.id,
            ruleName: 'Error Rate Monitor',
            timestamp: Date.now(),
          }
          break
        case 'incident_resolved':
          event = {
            type: 'incident_resolved',
            userId: user.id,
            incidentId: `incident_${Date.now()}`,
            timestamp: Date.now(),
          }
          break
        case 'metric_viewed':
          event = {
            type: 'metric_viewed',
            userId: user.id,
            metricType: 'latency',
            timestamp: Date.now(),
          }
          break
        case 'comment_added':
          event = {
            type: 'comment_added',
            userId: user.id,
            entityId: `entity_${Date.now()}`,
            comment: 'Investigating the latency spike',
            timestamp: Date.now(),
          }
          break
        default:
          return
      }

      this.handleEvent(event)
    }, 8000 + Math.random() * 12000)

    simulatedUsers.forEach((user, index) => {
      setTimeout(() => {
        this.handleEvent({
          type: 'user_joined',
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          timestamp: Date.now(),
        })
      }, index * 2000)
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`)
      this.connect()
    }, delay)
  }

  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  send(event: Partial<CollaborationEvent>) {
    if (this.isSimulated) {
      this.handleEvent({ ...event, timestamp: Date.now() } as CollaborationEvent)
      return
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event))
    }
  }

  on(eventType: string, handler: (event: CollaborationEvent) => void) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set())
    }
    this.eventHandlers.get(eventType)!.add(handler)
  }

  off(eventType: string, handler: (event: CollaborationEvent) => void) {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  private handleEvent(event: CollaborationEvent) {
    const handlers = this.eventHandlers.get(event.type)
    if (handlers) {
      handlers.forEach(handler => handler(event))
    }

    const allHandlers = this.eventHandlers.get('*')
    if (allHandlers) {
      allHandlers.forEach(handler => handler(event))
    }
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.send({ type: 'user_left', userId: this.userId, timestamp: Date.now() })
      this.ws.close()
      this.ws = null
    }
  }
}
