export type CollaborationEvent = 
  | { type: 'user_joined'; userId: string; userName: string; userAvatar: string; timestamp: number }
  | { type: 'rule_created'; userId: string; ruleName: string
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number
  | { type: 'rule_created'; userId: string; ruleName: string; timestamp: number }
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number }
  | { type: 'metric_viewed'; userId: string; metricType: string; timestamp: number }
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timestamp: number }
  | { type: 'presence_update'; userId: string; status: 'active' | 'idle' | 'away'; timestamp: number }
  | { type: 'cursor_move'; userId: string; x: number; y: number; timestamp: number }
  | { type: 'chat_message'; userId: string; incidentId: string; message: string; timestamp: number };

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

    // Simulate random events - reduced frequency from 8-13s to 30-60s
    this.simulationInterval = setInterval(() => {
      const user = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)]
      const eventTypes = ['alert_acknowledged', 'rule_created', 'rule_updated', 'incident_resolved', 'metric_viewed', 'comment_added']
      const eventType = event
      let event: CollaborationEvent | null = null
      switch (eventType) {
          event = {
            userId: user.id,
     

          event = {
            userId: user.id,
            timestamp: Date.now(),
          break
          event = {

            timestamp: Date.now(),

          event = {
            userId: user.id,
            timesta
          break
          event = {
            userId: user.id,
            timestamp: Date.now()
          b
          event
            userId: user.id,
            comment
          }
      }
      if (event) {
      }

    setInterval
        if (Math.random() > 
            type: '
            x: Math.random() * 10
            timestamp: Date.
        }
    }, 5000)

    if (this.re
      return

    const delay = Math.min(1000 * Math
    setTimeout(() => {
      this.connect()
  }
  private s
    this.heartb
        this.ws.send(JSON.str
    }, 30000)

    if (this.heartbeatInterv
      this.heartbeatInterval = nul
  }
  on(eventT
      this.even
    this.eventHandlers.get(ev

    const handlers = this.eventHan
      this.eventHandlers.set
        handlers.filter(h => h !== handler
    }

    if (thi
      this.simu


      this.ws.clos
    }
}
















