export interface TelemetryMetric {
  id: string
  timestamp: number
  type: 'request' | 'latency' | 'error' | 'tokens' | 'cost'
  value: number
  metadata: {
    model: string
    endpoint: string
    statusCode: number
    userId: string
    errorType?: string
  }
}

export interface MetricsSummary {
  totalRequests: number
  errorRate: number
  avgLatency: number
  p95Latency: number
  p99Latency: number
  totalCost: number
  totalTokens: number
}

export type MetricType = 'avgLatency' | 'p95Latency' | 'p99Latency' | 'errorRate' | 'totalCost' | 'totalTokens' | 'totalRequests'

export type RuleCondition = 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
export type RuleSeverity = 'info' | 'warning' | 'critical'
export type RuleAction = 'alert' | 'incident' | 'notify'

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
  metadata?: {
    metric: MetricType
    threshold: number
    condition: RuleCondition
  }
  acknowledged: boolean
}

export type IncidentStatus = 'open' | 'investigating' | 'resolved'

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
}

export type WebhookProvider = 'slack' | 'pagerduty'

export interface WebhookConfig {
  id: string
  name: string
  provider: WebhookProvider
  enabled: boolean
  url: string
  severityFilter: RuleSeverity[]
  createdAt: number
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
  elevenLabs: {
    apiKey: string
    agentId: string
    enabled: boolean
  }
}

export interface UserProfile {
  userId: string
  email: string
  displayName: string
  organization?: string
  createdAt: number
  apiConfig: APIConfig
}
