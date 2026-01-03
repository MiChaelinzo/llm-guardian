export type CollaborationEvent = 
  | { type: 'user_joined'; userId: string; userName?: string; userAvatar?: string; timestamp: number }
  | { type: 'user_left'; userId: string; timestamp: number }
  | { type: 'rule_created'; userId: string; ruleName: string; timestamp: number }
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'alert_acknowledged'; userId: string; alertId: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number }
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timestamp: number }
  | { type: 'chat_message'; userId: string; incidentId: string; message: string; timestamp: number }
  | { type: 'cursor_move'; userId: string; x: number; y: number; timestamp: number }
  | { type: 'presence_update'; userId: string; status: string; timestamp: number }
  | { type: 'metric_viewed'; userId: string; metricName: string; timestamp: number }

export interface CollaborationUser {
  id: string
  userId: string
  name: string
  userName?: string
  avatar?: string
  userAvatar?: string
  status: 'active' | 'idle' | 'offline' | string
  lastSeen: number
  cursorPosition?: { x: number; y: number }
}

export interface UserPresence {
  userId: string
  name: string
  avatar?: string
  status: 'active' | 'idle' | 'offline'
  online: boolean
  lastSeen: number
  cursorPosition?: { x: number; y: number }
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private userId: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private heartbeatInterval: number | null = null
  private eventHandlers: Array<(event: CollaborationEvent) => void> = []
  private isSimulated = true
  private simulationInterval: number | null = null

  constructor(userId: string) {
    this.userId = userId
  }

  connect() {
    if (this.isSimulated) {
      this.startSimulation()
      return
    }

    try {
      this.ws = new WebSocket('wss://your-websocket-endpoint')
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.send({ type: 'user_joined', userId: this.userId, timestamp: Date.now() })
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
        this.reconnect()
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.startSimulation()
    }
  }

  private startSimulation() {
    const simulatedEvents = [
      { type: 'rule_created', userId: 'sim_user_1', ruleName: 'Auto-generated rule' },
      { type: 'comment_added', userId: 'sim_user_2', entityId: 'incident_1', comment: 'Investigating...' },
    ]

    this.simulationInterval = window.setInterval(() => {
      const randomEvent = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)]
      const event = {
        ...randomEvent,
        timestamp: Date.now()
      } as CollaborationEvent
      
      this.handleEvent(event)

      const cursorEvent: CollaborationEvent = {
        type: 'cursor_move',
        userId: 'sim_user_' + Math.floor(Math.random() * 3),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        timestamp: Date.now()
      }
      this.handleEvent(cursorEvent)
    }, 5000)
  }

  private reconnect() {
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
        this.send({ type: 'presence_update', userId: this.userId, status: 'active', timestamp: Date.now() })
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

  send(event: CollaborationEvent) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event))
    }
  }

  disconnect() {
    if (this.ws) {
      this.send({ type: 'user_left', userId: this.userId, timestamp: Date.now() })
      this.ws.close()
      this.ws = null
    }
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }
    
    this.stopHeartbeat()
  }
}
