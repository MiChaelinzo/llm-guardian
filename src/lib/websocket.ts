export type CollaborationEvent = 
  | { type: 'user_joined'; userId: string; userName: string; userAvatar: string; timestamp: number }
  | { type: 'user_left'; userId: string; timestamp: number }
  | { type: 'alert_acknowledged'; userId: string; alertId: string; timestamp: number }
  | { type: 'rule_created'; userId: string; ruleName: string; timestamp: number }
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number }
  | { type: 'metric_viewed'; userId: string; metricType: string; timestamp: number }
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timestamp: number }
  | { type: 'presence_update'; userId: string; status: 'active' | 'idle' | 'away'; timestamp: number }
  | { type: 'cursor_move'; userId: string; x: number; y: number; timestamp: number }
  | { type: 'chat_message'; userId: string; incidentId: string; message: string; timestamp: number };

export interface CollaborationUser {
  id: string
  name: string
  avatar: string
  status: 'active' | 'idle' | 'away'
  cursorPosition?: { x: number; y: number }
  lastSeen: number
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private userId: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private heartbeatInterval: NodeJS.Timeout | null = null
  private eventHandlers: Map<string, ((event: CollaborationEvent) => void)[]> = new Map()
  private isSimulated: boolean
  private simulationInterval: NodeJS.Timeout | null = null

  constructor(userId: string, useSimulation = true) {
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
      console.error('Failed to create WebSocket:', error)
      this.attemptReconnect()
    }
  }

  send(event: CollaborationEvent) {
    if (this.isSimulated) {
      // Echo back local events in simulation mode
      setTimeout(() => this.handleEvent(event), 50)
      return
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event))
    }
  }

  private handleEvent(event: CollaborationEvent) {
    const handlers = this.eventHandlers.get(event.type)
    if (handlers) {
      handlers.forEach(handler => handler(event))
    }
    
    // Also trigger generic listeners if needed
    const allHandlers = this.eventHandlers.get('*')
    if (allHandlers) {
      allHandlers.forEach(handler => handler(event))
    }
  }

  private startSimulation() {
    const simulatedUsers: CollaborationUser[] = [
      { id: 'user_sim_1', name: 'Alice Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', status: 'active', lastSeen: Date.now() },
      { id: 'user_sim_2', name: 'Bob Martinez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', status: 'active', lastSeen: Date.now() },
      { id: 'user_sim_3', name: 'Carol Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol', status: 'idle', lastSeen: Date.now() },
    ]

    // Simulate random events
    this.simulationInterval = setInterval(() => {
      const user = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)]
      const eventTypes = ['alert_acknowledged', 'rule_created', 'rule_updated', 'incident_resolved', 'metric_viewed', 'comment_added']
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

      let event: CollaborationEvent | null = null

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
            ruleName: 'High Latency Alert',
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
            timestamp: Date.now()
          }
          break
        case 'comment_added':
          event = {
            type: 'comment_added',
            userId: user.id,
            entityId: `evt_${Date.now()}`,
            comment: 'I am investigating this anomaly.',
            timestamp: Date.now()
          }
          break
      }

      if (event) {
        this.handleEvent(event)
      }
    }, 8000 + Math.random() * 5000)

    // Simulate cursor moves
    setInterval(() => {
      simulatedUsers.forEach((user) => {
        if (Math.random() > 0.7) {
          this.handleEvent({
            type: 'cursor_move',
            userId: user.id,
            x: Math.random() * 1000,
            y: Math.random() * 800,
            timestamp: Date.now()
          })
        }
      })
    }, 1000)
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    setTimeout(() => {
      console.log(`Attempting reconnect ${this.reconnectAttempts}...`)
      this.connect()
    }, delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
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

  on(eventType: string, handler: (event: CollaborationEvent) => void) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    this.eventHandlers.get(eventType)?.push(handler)
  }

  off(eventType: string, handler: (event: CollaborationEvent) => void) {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      this.eventHandlers.set(
        eventType, 
        handlers.filter(h => h !== handler)
      )
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