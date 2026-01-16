export type CollaborationEvent = 
  | { type: 'user_joined'; userId: string; timestamp: number }
  | { type: 'user_left'; userId: string; timestamp: number }
  | { type: 'presence_update'; userId: string; status: 'active' | 'idle' | 'offline'; timestamp: number }
  | { type: 'rule_updated'; userId: string; ruleName: string; timestamp: number }
  | { type: 'rule_deleted'; userId: string; ruleName: string; timestamp: number }
  | { type: 'alert_acknowledged'; userId: string; alertId: string; timestamp: number }
  | { type: 'incident_created'; userId: string; incidentId: string; timestamp: number }
  | { type: 'cursor_move'; userId: string; x: number; y: number; timestamp: number };

export interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'idle' | 'offline';
  online: boolean;
  lastSeen: number;
  cursorPosition?: { x: number; y: number };
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private userId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private heartbeatInterval: number | null = null;
  private eventHandlers: Array<(event: CollaborationEvent) => void> = [];
  private isSimulated = true;
  private simulationInterval: number | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  connect(wsUrl?: string) {
    if (this.isSimulated || !wsUrl) {
      this.startSimulation();
      return;
    }

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.send({ type: 'user_joined', userId: this.userId, timestamp: Date.now() });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as CollaborationEvent;
          this.handleEvent(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopHeartbeat();
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      this.reconnect();
    }
  }

  private startSimulation() {
    if (this.simulationInterval) return;

    console.log('Starting simulation mode');
    this.simulationInterval = window.setInterval(() => {
      // Simulate random cursor movements from other users
      const event: CollaborationEvent = {
        type: 'cursor_move',
        userId: 'simulated-user-1',
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        timestamp: Date.now()
      };
      this.handleEvent(event);
    }, 100);
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      // Assuming wsUrl is stored or passed again, for now just retrying connection logic
      // In a real scenario, you'd store the URL in the class
      if (this.ws) {
        this.connect(this.ws.url);
      }
    }, this.reconnectDelay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = window.setInterval(() => {
      this.send({ 
        type: 'presence_update', 
        userId: this.userId, 
        status: 'active', 
        timestamp: Date.now() 
      });
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleEvent(event: CollaborationEvent) {
    this.eventHandlers.forEach(handler => handler(event));
  }

  onEvent(handler: (event: CollaborationEvent) => void) {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
    };
  }

  send(event: CollaborationEvent) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else if (this.isSimulated) {
      // In simulation mode, echo relevant events back or log them
      if (event.type !== 'cursor_move') {
        console.log('Simulated send:', event);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.send({ type: 'user_left', userId: this.userId, timestamp: Date.now() });
      this.ws.close();
      this.ws = null;
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    this.stopHeartbeat();
  }
}

