// Core telemetry and metrics types
export interface TelemetryMetric {
  id: string
  timestamp: number
  type: 'request' | 'latency' | 'error' | 'tokens' | 'cost'
  value: number
  metadata: {
    model?: string
    userId: string
    endpoint?: string
    statusCode?: number
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
  cost: number
  totalTokens: number
  tokens: number
  requests: number
  requestsPerMinute: number
}

export type MetricType = 'avgLatency' | 'p95Latency' | 'p99Latency' | 'errorRate' | 'cost' | 'tokens' | 'requests' | 'totalCost' | 'totalTokens' | 'totalRequests'
export type RuleCondition = 'gt' | 'lt' | 'gte' | 'lte' | 'eq'
export type RuleSeverity = 'info' | 'warning' | 'critical'
export type RuleAction = 'alert' | 'incident' | 'notify'
export type IncidentStatus = 'open' | 'investigating' | 'resolved'

// Detection rules
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

// Alerts
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

// File attachments
export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  uploadedAt: number
  uploadedBy?: string
  uploadedByName?: string
  description?: string
  aiSuggestion?: string
}

// Webhook configuration
export interface WebhookConfig {
  id: string
  name: string
  provider: 'slack' | 'discord' | 'pagerduty' | 'teams'
  url: string
  enabled: boolean
  severityFilter: RuleSeverity[]
  createdAt: number
}

// SLO (Service Level Objective)
export interface SLO {
  id: string
  name: string
  description?: string
  metric: MetricType
  target: number
  timeWindow: number
  enabled: boolean
  createdAt: number
}

// Dashboard widget
export interface DashboardWidget {
  id: string
  title: string
  type: string
  size: { width: number; height: number }
  position?: { x: number; y: number }
  config?: Record<string, any>
}

// Incidents
export interface Incident {
  id: string
  title: string
  description: string
  severity: RuleSeverity
  status: IncidentStatus
  createdAt: number
  resolvedAt?: number
  alerts: Alert[]
  attachments?: FileAttachment[]
  aiSuggestion?: string
  correlationGroupId?: string
}

// Chat related types
export interface ChatMessage {
  id: string
  incidentId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: number
  type: 'message' | 'system' | 'action'
  metadata?: {
    action?: string
    relatedAlertId?: string
  }
}

export interface ChatChannel {
  id: string
  incidentId: string
  name: string
  createdAt: number
  lastMessageAt?: number
  participantIds: string[]
  unreadCount?: number
}

// Notification preferences
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
}

// Email notification configuration
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

// Email notification log
export interface EmailNotificationLog {
  id: string
  email: string
  subject: string
  body?: string
  sentAt: number
  relatedIncidentId?: string
  relatedAlertId?: string
  status: 'sent' | 'failed'
  errorMessage?: string
}

// API configuration
export interface APIConfig {
  googleCloud: {
    projectId?: string
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
  elevenLabs: {
    apiKey: string
    agentId: string
    enabled: boolean
  }
}

// Alert correlation types
export interface CorrelationFactor {
  type: 'temporal' | 'metric' | 'severity' | 'pattern'
  score: number
  description: string
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
  rootCause: string
  correlationScore: number
  correlationFactors: CorrelationFactor[]
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
