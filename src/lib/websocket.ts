export type CollaborationEvent = 
  | { type: 'user_left'; userId: string; timestamp: number }
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: n
  | { type: 'alert_acknowledged'; userId: string; alertId: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number }
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timestamp: number }
  | { type: 'chat_message'; userId: string; incidentId: string; message: string; timestamp: number }


  name: string
  avatar?: s
  status: 'act
  cursorPosition?

 

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
  }

      this.ws = new WebSocket('
      this.ws.onopen = (
        this.send({ type: 
   

          const data 
        }
        }

        console.error('WebSock

        this.stopHeartbeat()
      }
      c


    const sim
      { type: 'rule_created', userId: 'sim_us
      { type: 'comment_added', u

      const randomEvent = simulatedEvents[Math.floor(Math.random() *

       

        timestamp: Date.now()
      this.handleEvent(cursorEvent)
  }

      return

      console.error('Max reconn
    }
    this.reconnectAtt
      console.log(`Attempting to reconnect (${this.reconne
    }, this.reconnectDelay * 

   

    }, 30000)

    if (this.heartbeatInterval) {
      this.heartbeatInterval = null
  }
  private handleEvent(event: CollaborationEvent) {
  }

    return () => {
    }


      this.eventHandlers = this.eventHandlers.f
  }
  send(event: CollaborationEv
      this.ws.send(JSON.stringify(event))
  }
  disconnect() {
      c
    }
    if (this.
   

  }






























































