export type CollaborationEvent = 
  | { type: 'user_joined'; userId: string; userName: string; userAvatar: string; timestamp: number }
  | { type: 'rule_created'; userId: string; ruleName: string; timestamp: number }
  | { type: 'rule_created'; userId: string; ruleName: string; timestamp: number }
  | { type: 'metric_viewed'; userId: string; metricType: string; timestamp: numbe
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number }
  | { type: 'metric_viewed'; userId: string; metricType: string; timestamp: number }
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timestamp: number }
  status: 'active' | 'idle' | 'away'
}
export class WebSocketService {

  private maxReconnectAttempts = 5
  private ev
  private simu
  constructor(us
    this.isSimulated = useSimulation
    if (this.isSim
 

    if (this.isSimulated) retur
    try {

        console.log('WebSocket 
        this.startHeartbeat()
          type: 'user_joined', 
          userName: 'CurrentUser', 
          timestamp: Date.now(
      }

          const data = JSON.parse(event.data) as Coll
        } catch (error) 
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
        case 'rule_updated':
       

          }
        case 'incident_resolved':
            type: 'incident_
            incidentId: `incide
       
        case 'metric_
            type: 'metric_viewed',
            metricType: 'late
     
   

            entityId: `entity_${Dat
            timestamp: Date
          break
      
     

    setInterval(() => {
        if (Math.random() > 0.7) {
     
   

        }
    }, 5000)

    if (this.reconnectAttempts >= this.maxReconne
     

    const delay = Math.min(1000 * Math.pow(2, this.
    setTimeout(() => {
      this.connect()
  }
  p

      }
  }
  private stopHeartbeat() {
      clearInterval(this.heartbeatInterval)
    }


    this.eventHandlers.set(eventType, handlers)

    const handlers = this.eventHandlers.get(eventType)
      this.eventHandlers.set(
      
    }

    if (this.simulationInt
      this.simulationInterval = nu

    
      this.ws.close()
    }
}


        case 'rule_created':
          event = {
            type: 'rule_created',
            userId: user.id,
            ruleName: 'New Detection Rule',
            timestamp: Date.now(),
          }
          break
        case 'rule_updated':
          event = {
            type: 'rule_updated',
            userId: user.id,
            ruleName: 'Updated Rule',
            timestamp: Date.now(),
          }
          break
        case 'incident_resolved':
          event = {
            type: 'incident_resolved',
            userId: user.id,
            incidentId: `incident_${Date.now()}`,
            timestamp: Date.now()
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
            entityId: `entity_${Date.now()}`,
            comment: 'New comment added',
            timestamp: Date.now()
          }
          break
      }
      
      if (event) {
        this.handleEvent(event)
      }
    }, 45000)

    setInterval(() => {
      simulatedUsers.forEach(user => {
        if (Math.random() > 0.7) {
          this.handleEvent({
            type: 'cursor_move',
            userId: user.id,
            x: Math.random() * 100,
            y: Math.random() * 100,
            timestamp: Date.now()
          })
        }
      })
    }, 5000)
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`)
      this.connect()
    }, delay)
  }

  private startHeartbeat() {
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
    const handlers = this.eventHandlers.get(eventType) || []
    handlers.push(handler)
    this.eventHandlers.set(eventType, handlers)
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
