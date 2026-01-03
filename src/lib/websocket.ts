export type CollaborationEvent = 
  | { type: 'user_left'; userId: string; timestamp: number }
  | { type: 'rule_created'; userId: string; ruleName: string; timestamp: number }
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'alert_acknowledged'; userId: string; alertId: string; timestamp: number }
  | { type: 'incident_resolved'; userId: string; incidentId: string; timestamp: number }
  | { type: 'comment_added'; userId: string; entityId: string; comment: string; timestamp: number }
  | { type: 'metric_viewed'; userId: string; metricName: string; timestamp: number }


  name: string
  id: string
}
  avatar: string
  id: string
}

type EventHandler = (event: CollaborationEvent) => void

export class WebSocketManager {
  private ws: WebSocket | null = null
  private userId: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: number | null = null
  private eventHandlers = new Map<string, Set<EventHandler>>()
  private isSimulated = true
  private simulationInterval: number | null = null

  constructor(userId: string) {
    this.userId = userId
    this.startSimulation()
  }

        } catch (error) {
        }

        c


        this.attemptReconnect(
    } catch (error) {
      this.attemptReconnect()
  }
  private startSimul
      { type: 'rule_created', u
      { type: 'alert_acknowledg
      { type: 'comment_added', user
    ]
    this.simulationInterval = wi
      cons
    }, 

        type: 'cursor_move',
        x: Ma
        timestamp: Date.now()
      this.handleEvent(cursorEve
  }
  private attemptReconnect() {
      con
    }

    
      console.log(`Attempting to reconnect (${th
    }, 

    this.heartbeatInterval = wi
        this.ws.send(JSON.stringify({ type: '
    }, 30000)

    if 
      this.heartbeatI
  }
  send(event: CollaborationEv
     


  }
  on(eventType: string, handler: EventHandler) {
      this.eventHandlers.set(eventType, new Set())
    this.eventHandlers.get(eventType)!.add(handler)

    const handlers = this.eventHandlers.get(eventType)
      handlers.delete(handler)
  }
  pri

        try {
        } catch (error) {
        }
    }
    const all

          handler(event
          console.error('Error in wildcard even
      })
  }
  disconnect() {
      clearInterval(this.simula
    }
    thi
    if (this.ws) {
      this.w
  }

  constructor(userId: string, 
  }


























































































