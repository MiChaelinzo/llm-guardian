export type CollaborationEvent = 
  | { type: 'user_joined'; userId: string; userName: string; userAvatar: string; timestamp: number }
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: n
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timest

  id: string
  avatar: string
}

  private userId: string
  private re
  private hear
  private simula
  constructor(user
 

  }
  connect(url?: string) {

      this.ws = new WebSocket(url || 'wss://voicewatch.example.com/ws')
      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.send({ 
          userId: this.userId,
          userAvatar: '', 


        try {
          this.handleEvent(data)
          console.error('Fa
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
      ]


        case 'rule_created':
            type: 'rule_creat
     
   

            type: 'rule_updated',
            ruleName: 'Upda
          }
        case
     

          }
        case 'metric_viewed':
     
   

        case 'comment_added':
            type: 'comment_added',
            entityId: `entity_${Date.now()}`,
   

      
        this.handleEvent(eve
    }, 45000)
    setInterval(() => {
     

            x: Math.random() * 100,
            timestamp: Date.now()
        }
    }, 5000)

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {



    setTimeout(() => {
      this.connect()
  }
  private startHeartbeat() {
      if (this.ws && this.ws
      }
  }
  private s
      clearInte
    }

    const handlers = this.eventHa
    this.eventHandlers.set(e

    const handlers = this.eventHan
      this.
        handler
    }

    if (this.simulationInterval) {
      this.simulationInterva

    
      this.
    }
}


































































































