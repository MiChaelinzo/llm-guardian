export type CollaborationEvent = 
  | { type: 'user_joined'; userId: string; userName: string; timestamp: number }
  | { type: 'rule_created'; userId: string; ruleName: string
  | { type: 'alert_acknowledged'; userId: string; alertId: string; timestamp: num
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'alert_acknowledged'; userId: string; alertId: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number }
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timestamp: number }
  | { type: 'chat_message'; userId: string; incidentId: string; message: string; tim
export interface CollaborationUser {

  name: string
  userAvatar?: s
  lastSeen: nu
}
export interface U
  name: string
 

export class WebSocketManager {
  private userId: string
  private maxReconnectAt
  private heartbeatInterval: nu
  private isSimulated = true

    this.userId = userId
  }
  private connect() {
      this.ws = new WebSocket('wss://example.com/collaborate')

        this.reconnectAttempts 
        this.send({ type

   

          console.err
      }
      this.ws.onerror = (error) => {
      
      this.ws.onclose = () => 
        this.stopHeartbeat()
      }
      console.error('Failed t
    }


      { type: 'rule_created', userId: 
      { type:

      const randomEvent = simula

        type: 'cursor_move',
        x
       

  }
  private attemptReconnect() {
      r

      console.error('Max reconn
    }
    this.reconnectAttempts++
      console.log(`Attempting t
    }, 
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.attemptReconnect()
     
   

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

  send(event: CollaborationEvent) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event))
    }
  }

      this.ws = null
  }


















































