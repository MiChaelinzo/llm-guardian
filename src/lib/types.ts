export interface TelemetryMetric {
  timestamp: number
  type: 'request' | 'latency' | 'error' | 'tokens' | 'cost'
  value: number
  metadata: {
    model?: string
    statusCode: number
    userId: string
    errorType?: string
  }
}

export interface MetricsSummary {
  totalRequests: number
  avgLatency: number
  p95Latency: number
  p99Latency: number
  errorRate: number
  totalCost: number
  totalTokens: number
  requestsPerMinute: number
}

export type MetricType = 'avgLatency' | 'p95Latency' | 'p99Latency' | 'errorRate' | 'cost' | 'tokens' | 'requests'
export type RuleCondition = 'gt' | 'lt' | 'gte' | 'lte' | 'eq'
export type RuleSeverity = 'info' | 'warning' | 'critical'
export type RuleAction = 'alert' | 'incident' | 'notify'
export type IncidentStatus = 'open' | 'investigating' | 'resolved'

export interface DetectionRule {
  id: string
  name: string
  description: string
  metric: MetricType
  condition: RuleCondition
  threshold: number
  severity: RuleSeverity
  enabled: boolean
  actions: RuleAction[]
}

export interface Alert {
  id: string
  ruleId: string
  ruleName: string
  message: string
  severity: RuleSeverity
  timestamp: number
  value: number
  acknowledged: boolean
  metadata: {
    metric: MetricType
    threshold: number
    condition: RuleCondition
  }
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  uploadedAt: number
  uploadedBy: string
  uploadedByName: string
}

export interface Incident {
  id: string
  title: string
  description: string
  severity: RuleSeverity
  status: IncidentStatus
  createdAt: number
  resolvedAt?: number
  alerts: Alert[]
  aiSuggestion?: string
  attachments?: FileAttachment[]
  correlationGroupId?: string
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
  createdAt: number
}

export interface NotificationPreference {
  id: string
  userId: string
  channels: {
    email: boolean
    webhook: boolean
    voice: boolean
    inApp: boolean
  }
  severityThreshold: RuleSeverity
  quietHours?: {
    enabled: boolean
    start: string
    end: string
  }
  grouping?: {
    enabled: boolean
    windowMinutes: number
  }
  createdAt?: number
}

export interface APIConfig {
  googleCloud: {
    projectId: string
    apiKey: string
    enabled: boolean
  }
  datadog: {
    apiKey: string
    appKey: string
    site: string
    enabled: boolean
  }
  confluent: {
    apiKey: string
    apiSecret: string
    bootstrapServer: string
    enabled: boolean
  }
  elevenlabs: {
    apiKey: string
    agentId: string
    enabled: boolean
  }
}

export interface UserProfile {
  id: string
  email: string
  displayName: string
  organization?: string
  createdAt: number
  apiConfig: APIConfig
}

export interface ChatMessage {
  id: string
  incidentId: string
  userId: string
  userName: string
  userAvatar: string
  message: string
  timestamp: number
  type: 'message' | 'system' | 'action'
  metadata?: {
    actionType?: string
    relatedAlertId?: string
  }
}

export interface ChatChannel {
  id: string
  incidentId: string
  name: string
  createdAt: number
  participantIds: string[]
  lastMessageAt?: number
  unreadCount?: number
}

export interface EmailNotificationConfig {
  id: string
  email: string
  enabled: boolean
  severityFilter: RuleSeverity[]
  notifyOnIncidentCreated: boolean
  notifyOnIncidentResolved: boolean
  notifyOnAlerts: boolean
  createdAt: number
}

export interface EmailNotificationLog {
  id: string
  recipient: string
  subject: string
  body: string
  sentAt: number
  status: 'sent' | 'failed' | 'pending'
  relatedIncidentId?: string
  relatedAlertId?: string
  errorMessage?: string
}

export interface CorrelationGroup {
  id: string
  name: string
  description: string
  createdAt: number
  updatedAt: number
  severity: RuleSeverity
  status: 'active' | 'resolved'
  incidentIds: string[]
  alertIds: string[]
  rootCause?: string
  correlationScore: number
  correlationFactors: CorrelationFactor[]
}

export interface CorrelationFactor {
  type: 'temporal' | 'metric' | 'severity' | 'pattern'
  score: number
  description: string
}

export interface CorrelationRule {
  id: string
  name: string
  enabled: boolean
  timeWindowMs: number
  minAlerts: number
  scoreThreshold: number
  autoCreateIncident: boolean
  groupBySeverity: boolean
  groupByMetric: boolean
  createdAt: number
}
