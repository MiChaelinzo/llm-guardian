export interface TelemetryMetric {
  timestamp: number
  type: 'request' | 'latency' | 'error' | 'tokens' | 'cost'
  value: number
    model?: s
    userId: string
  }

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
  id: string
  description: string
 

  aiSuggestion?: string
  correlatio


  id: string
  provider: WebhookProvi
  url: string
  createdAt: number

  id: string
  description: string
  target: number
 

  createdAt: number

  id: string
  title: str
  size: { widt
}
export interface D
  name: strin
  widgets: DashboardWidget[]
}
e

  filters: {
    status?:
    searchQuer
  createdAt: number

  id: string
  channels: {
    webhook: boole
    inApp: boolean
  severityThreshold: RuleSeveri
    enabled: boolea
    end: string
 

  createdAt?: number

  googleCloud: {
    apiKey: str
  }
    apiKey: string
    site: string
 

    bootstrapServer: string
  }
    apiKey: st
    enabled: boolean
}
export interface Us
 

  apiConfig: APIConfig

  id: string
  userId: string
  userAvatar
  timestamp: number
  metadata?: {
    relatedAlertId?: s
}
exp
  incidentId: strin
 

}
export inter
  email: string
  severityFil
  notifyOnIncident
  createdAt: number

  id: string
  s
  sentAt: number
  relatedInciden
  errorMessage?: str

  id: string
  d
  updatedAt: n
  status: 'active' |
  alertIds: string[]
  c
}
e

}
export interface
  name: string
  timeWindowMs: nu
  scoreThreshold: nu
  g
  createdAt:


























































































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
