export type CollaborationEvent = 
  | { type: 'user_joined'; userId: string; userName: string; userAvatar: string; timestamp: number }
  | { type: 'user_left'; userId: string; timestamp: number }
  | { type: 'rule_created'; userId: string; ruleName: string; timestamp: number }
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'alert_acknowledged'; userId: string; alertId: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number }
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timestamp: number }
  | { type: 'metric_viewed'; userId: string; metricName: string; timestamp: number }
  | { type: 'cursor_move'; userId: string; x: number; y: number; timestamp: number }
  | { type: 'presence_update'; userId: string; status: 'active' | 'idle' | 'away'; timestamp: number }
  | { type: 'chat_message'; userId: string; incidentId: string; message: string; timestamp: number }

export interface PresenceUser {
  id: string
  name: string
  avatar: string
  lastSeen: number
}

export interface CollaborationUser {
  id: string
  name: string
  avatar: string
  status: 'active' | 'idle' | 'away'
  lastSeen: number
  cursorPosition?: { x: number; y: number }
}

type EventHandler = (event: CollaborationEvent) => void

export class WebSocketManager {
  private ws: WebSocket | null = null
  private userId: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: number | null = null
  private eventHandlers = new Map<string, Set<EventHandler>>()
  private isSimulated = true
  private simulationInterval: number | null = null

  constructor(userId: string) {
    this.userId = userId
    this.startSimulation()
  }

  connect(url?: string) {
    if (this.isSimulated) return

    try {
      this.ws = new WebSocket(url || 'wss://voicewatch.example.com/ws')

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.send({ 
          type: 'user_joined', 
          userId: this.userId, 
          userName: 'CurrentUser', 
          userAvatar: '', 
          timestamp: Date.now() 
        })
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
      console.error('Failed to connect WebSocket:', error)
      this.attemptReconnect()
    }
  }

  private startSimulation() {
    const simulatedEvents: CollaborationEvent[] = [
      { type: 'rule_created', userId: 'simulated_user', ruleName: 'Latency Threshold', timestamp: Date.now() },
      { type: 'rule_updated', userId: 'simulated_user', ruleName: 'Error Rate Monitor', timestamp: Date.now() },
      { type: 'alert_acknowledged', userId: 'simulated_user', alertId: 'alert_123', timestamp: Date.now() },
      { type: 'incident_resolved', userId: 'simulated_user', incidentId: 'incident_456', timestamp: Date.now() },
      { type: 'comment_added', userId: 'simulated_user', entityId: 'incident_789', comment: 'Investigating root cause', timestamp: Date.now() },
      { type: 'metric_viewed', userId: 'simulated_user', metricName: 'Latency', timestamp: Date.now() }
    ]

    this.simulationInterval = window.setInterval(() => {
      const randomEvent = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)]
      const event = { ...randomEvent, timestamp: Date.now() }
      this.handleEvent(event)
    }, 45000)

    setInterval(() => {
      const cursorEvent: CollaborationEvent = {
        type: 'cursor_move',
        userId: 'simulated_user',
        x: Math.random() * 100,
        y: Math.random() * 100,
        timestamp: Date.now()
      }
      this.handleEvent(cursorEvent)
    }, 5000)
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
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

  send(event: CollaborationEvent) {
    if (this.isSimulated) {
      return
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event))
    }
  }

  on(eventType: string, handler: EventHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set())
    }
    this.eventHandlers.get(eventType)!.add(handler)
  }

  off(eventType: string, handler: EventHandler) {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  private handleEvent(event: CollaborationEvent) {
    const handlers = this.eventHandlers.get(event.type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event)
        } catch (error) {
          console.error('Error in event handler:', error)
        }
      })
    }

    const allHandlers = this.eventHandlers.get('*')
    if (allHandlers) {
      allHandlers.forEach(handler => {
        try {
          handler(event)
        } catch (error) {
          console.error('Error in wildcard event handler:', error)
        }
      })
    }
  }

  disconnect() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }

    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export class WebSocketService extends WebSocketManager {
  constructor(userId: string, _isSimulated?: boolean) {
    super(userId)
  }
}
