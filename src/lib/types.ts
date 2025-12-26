export interface TelemetryMetric {
  id: string
  timestamp: number
  type: 'request' | 'error' | 'latency' | 'tokens' | 'cost'
  value: number
  metadata: {
    model?: string
    endpoint?: string
    statusCode?: number
    errorType?: string
    userId?: string
  }
}

export interface DetectionRule {
  id: string
  name: string
  description: string
  metric: string
  condition: 'gt' | 'lt' | 'eq'
  threshold: number
  severity: 'critical' | 'warning' | 'info'
  enabled: boolean
  actions: string[]
}

export interface Alert {
  id: string
  ruleId: string
  ruleName: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  timestamp: number
  value: number
  metadata: Record<string, unknown>
  acknowledged: boolean
}

export interface Incident {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  status: 'open' | 'investigating' | 'resolved'
  createdAt: number
  resolvedAt?: number
  alerts: Alert[]
  aiSuggestion?: string
}

export interface MetricSummary {
  avgLatency: number
  totalRequests: number
  errorRate: number
  totalCost: number
  totalTokens: number
  p95Latency: number
  p99Latency: number
}
