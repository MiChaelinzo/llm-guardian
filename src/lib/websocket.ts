export type CollaborationEvent = 
  | { type: 'user_left'; userId: string; timestamp: number }
  | { type: 'alert_acknowledged'; userId: string; alertId: s
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'metric_viewed'; userId: string; metricType: string; timestamp: number }
  | { type: 'presence_update'; userId: string; status: 'active' | 'idle' | 'away'
export interface CollaborationUser {
  name: string
  status: 'active' | 'idle' | 'away'
  cursorPosition?: { x: number; y: number }


  private maxReconnectAttempts = 5
  private he
  private even

    this.userId = userId
    
      this.startSimulation()
 


      this.ws = new WebSocket(url || 
      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.send({ type: 'user

        try {
          this.handleEvent(data)
          console.error('Failed to pa

      this.ws.onerror = (error) => {
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
       




        case 'alert_acknowledged
            type: 'alert_
            alertId: `alert_${Date.now()}`,
         
       

            ruleName: 'High Latency 
          }
       

            ruleName: 'Error Ra
          }
        case 'incident_resol
            type: 'incident_res
       
          }
        case 'metric_viewed':
     
   

        case 'comment_added':
            type: 'comment_a
            entityId: `entity_${Date.now()}`,
            timestamp: Date.now(),
          break
     

    }, 8000 + Math.ra
    simulatedUsers.forEach((us
        this.handleEvent({
          userId: user.id,
          userAvatar: user.avatar,
        })
    })

    if (this.reconnectAtte
     

    const delay = this.
    setTimeout(() => {
      this.connect()
  }
  private startHeartbeat() {
      if (this.ws && this.ws.
      }
  }
  private stopHeartbeat() {
      clearInterval(this
    }


      return

      this.ws.send(JSON.stringify(e

  on(eventType: string, ha
      this.eventHandlers.set(event
    this.eventHandl

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
}































































































































}
