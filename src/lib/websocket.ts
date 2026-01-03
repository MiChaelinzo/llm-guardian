export type CollaborationEvent = 
  | { type: 'user_joined'; userId: string; userName: string; userAvatar?: string; timestamp: number }
  | { type: 'user_left'; userId: string; timestamp: number }
  | { type: 'rule_created'; userId: string; ruleName: string; timestamp: number }
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'alert_acknowledged'; userId: string; alertId: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number }
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timestamp: number }
  | { type: 'chat_message'; userId: string; incidentId: string; message: string; timestamp: number }
  | { type: 'cursor_move'; userId: string; x: number; y: number; timestamp: number }
  | { type: 'metric_viewed'; userId: string; metricName: string; timestamp: number }
  | { type: 'presence_update'; userId: string; status: 'active' | 'idle' | 'away'; timestamp: number }

export interface CollaborationUser {
  id: string
  userId: string
  name: string
  userName: string
  avatar?: string
  userAvatar?: string
  status: 'active' | 'idle' | 'away'
  lastSeen: number
  cursorPosition?: { x: number; y: number }
}

export interface UserPresence {
  userId: string
  name: string
  avatar?: string
  online: boolean
  lastSeen: number
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private userId: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private heartbeatInterval: number | null = null
  private isSimulated = true
  private simulationInterval: number | null = null
  private eventHandlers: ((event: CollaborationEvent) => void)[] = []

  constructor(userId: string) {
    this.userId = userId
    this.startSimulation()
  }

  private connect() {
    try {
      this.ws = new WebSocket('wss://example.com/collaborate')

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.send({ type: 'user_joined', userId: this.userId, userName: 'User', timestamp: Date.now() })
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleEvent(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      this.ws.onclose = () => {
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
      { type: 'user_joined', userId: 'sim_user_1', userName: 'Team Member', timestamp: Date.now() },
      { type: 'rule_created', userId: 'sim_user_1', ruleName: 'Latency Alert', timestamp: Date.now() },
      { type: 'alert_acknowledged', userId: 'sim_user_2', alertId: 'alert_123', timestamp: Date.now() },
      { type: 'comment_added', userId: 'sim_user_1', entityId: 'inc_1', comment: 'Investigating...', timestamp: Date.now() }
    ]

    this.simulationInterval = window.setInterval(() => {
      const randomEvent = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)]
      this.handleEvent({ ...randomEvent, timestamp: Date.now() })

      const cursorEvent: CollaborationEvent = {
        type: 'cursor_move',
        userId: 'sim_user_1',
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        timestamp: Date.now()
      }
      this.handleEvent(cursorEvent)
    }, 10000)
  }

  private attemptReconnect() {
    if (this.isSimulated) {
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connect()
    }, this.reconnectDelay * this.reconnectAttempts)
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

  private handleEvent(event: CollaborationEvent) {
    this.eventHandlers.forEach(handler => handler(event))
  }

  onEvent(handler: (event: CollaborationEvent) => void) {
    this.eventHandlers.push(handler)
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== handler)
    }
  }

  on(eventType: string, handler: (event: CollaborationEvent) => void) {
    this.eventHandlers.push(handler)
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== handler)
    }
  }

  send(event: CollaborationEvent) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event))
    }
  }

  disconnect() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.stopHeartbeat()
  }
}
