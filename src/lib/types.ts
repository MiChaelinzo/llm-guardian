export interface TelemetryMetric {
  timestamp:
  timestamp: number
  type: 'request' | 'latency' | 'error' | 'tokens' | 'cost'
    statusCode:
    errorType
}
export interface Met
    statusCode: number
    userId: string
    errorType?: string
  }
}

export interface MetricsSummary {
  totalRequests: number
  name: string
  metric: MetricType
  threshold: number
  enabled: boolean
}
export interface Aler
 

  timestamp: number

    threshold: number
  }
}

export interface FileAttachment 
  name: stri
  size: number
  uploadedAt: number
  uploadedByName: st

  id: string
  description: string
  status: Incident
  resolvedAt?: number
 

export type WebhookProvi
export inter
  name: string
  enabled: boolean
  severityFilter:
}
export interface SL
  name: string
  metric: Metr
  timeWindow: number
  currentValue?: numb
  breaches?: number
}
export interface Dashbo
 

  config?: Record<string, any>

  id: string
  isDefault:
  createdAt: n

  size: number
  dataUrl: string
  uploadedAt: number
  uploadedBy: string
  uploadedByName: string
}

export interface Incident {
  }
  title: string
  description: string
  severity: RuleSeverity
  status: IncidentStatus
  createdAt: number
  resolvedAt?: number
  alerts: Alert[]
  aiSuggestion?: string
  attachments?: FileAttachment[]
}

export type WebhookProvider = 'slack' | 'discord' | 'pagerduty' | 'teams'

export interface WebhookConfig {
  id: string
  name: string
  provider: WebhookProvider
  enabled: boolean
  url: string
  severityFilter: RuleSeverity[]
  createdAt: number
}

export interface SLO {
  id: string
  name: string
  description: string
  metric: MetricType
  target: number
  timeWindow: number
  enabled: boolean
  currentValue?: number
  compliancePercentage?: number
  breaches?: number
  createdAt: number
}

export interface DashboardWidget {
  id: string
  type: 'metrics' | 'chart' | 'alerts' | 'incidents' | 'slo' | 'stream'
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  config?: Record<string, any>
}

export interface DashboardLayout {
  id: string
  name: string
  isDefault: boolean
  widgets: DashboardWidget[]
  createdAt: number
}

export interface FilterPreset {
  id: string
  name: string
  type: 'alert' | 'incident' | 'metric'
  filters: {
    severity?: RuleSeverity[]
    status?: IncidentStatus[]
    timeRange?: number
    searchQuery?: string
   
}

export interface NotificationPreference {
  id: string
  userId: string
  createdAt: 
    email: boolean
    webhook: boolean
    voice: boolean
    inApp: boolean
  }
  severityThreshold: RuleSeverity
  quietHours?: {
  notifyOnIncidentRe
    start: string
}
  }
  id: string
    enabled: boolean
    windowMinutes: number
  }
 

export interface APIConfig {
  googleCloud: {

    apiKey: string
    enabled: boolean
  }
  datadog: {
    apiKey: string

    site: string
    enabled: boolean
  }

    apiKey: string
    apiSecret: string
    bootstrapServer: string
    enabled: boolean
  }

    apiKey: string
    agentId: string
    enabled: boolean

}

export interface UserProfile {

  email: string
  displayName: string
  organization?: string
  createdAt: number
  apiConfig: APIConfig


export interface ChatMessage {
  id: string
  incidentId: string
  userId: string

  userAvatar: string

  timestamp: number
  type: 'message' | 'system' | 'action'
  metadata?: {

    relatedAlertId?: string

}

export interface ChatChannel {

  incidentId: string

  createdAt: number
  participantIds: string[]
  lastMessageAt?: number
  unreadCount?: number
}

export interface EmailNotificationConfig {

  email: string
  enabled: boolean
  severityFilter: RuleSeverity[]

  notifyOnIncidentResolved: boolean
  notifyOnAlerts: boolean
  createdAt: number



  id: string

  subject: string
  body: string
  sentAt: number
  status: 'sent' | 'failed' | 'pending'
  relatedIncidentId?: string

  errorMessage?: string

