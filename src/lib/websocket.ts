export type CollaborationEvent = 
  | { type: 'user_left'; userId: string; timestamp: number }
  | { type: 'rule_updated'; userId: string; ruleName: string
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: n
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'alert_acknowledged'; userId: string; alertId: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number }
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timestamp: number }
  avatar: string
}

  userId: string
  name: string
  avatar?: str
  lastSeen: numb
}
t

  private userId: string

  private heartbeatInterval: nu
  private isSimulated = true

    this.userId = userId
  }
  private connect() {
      this.ws = new WebSocket('wss://example.com/
      this.ws.onopen = () => {
        this.reconnectAttemp
        this.send({ type: 'user_joined', userId: t

        try {
    this.userId = userId
    this.startSimulation()
  }

  private connect() {
    try {
      this.ws = new WebSocket('wss://example.com/collaborate')
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.send({ type: 'user_joined', userId: this.userId, userName: 'User', timestamp: Date.now() })
       

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
        console.log('WebSocket closed')
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
    this.heartbeatInterval =
        userId: 'sim_user_1',
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,

      }
      this.handleEvent(cursorEvent)
    }, 10000)
  }

    if (this.ws && this.ws.rea
    if (this.isSimulated) {
  }
     

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

      }
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

    }
   

  send(event: CollaborationEvent) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event))
    }
   


    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set())
    }
    this.eventHandlers.get(eventType)!.add(handler)

    return () => {
      const handlers = this.eventHandlers.get(eventType)
      if (handlers) {
        handlers.delete(handler)

    }



    const handlers = this.eventHandlers.get(event.type)

      handlers.forEach(handler => {

          handler(event)

          console.error('Error in event handler:', error)
        }
      })
    }


    if (allHandlers) {

        try {

        } catch (error) {
          console.error('Error in wildcard event handler:', error)
        }

    }



    if (this.simulationInterval) {

      this.simulationInterval = null



    
    if (this.ws) {
      this.ws.close()

    }

}
