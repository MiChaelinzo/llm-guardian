import type { TelemetryMetric, MetricsSummary, DetectionRule, Alert } from './types'

export function calculateMetrics(metrics: TelemetryMetric[], timeRange: number): MetricsSummary {
  const now = Date.now()
  const cutoff = now - timeRange
  
  const recentMetrics = metrics.filter(m => m.timestamp >= cutoff)
  
  const requests = recentMetrics.filter(m => m.type === 'request')
  const errors = recentMetrics.filter(m => m.type === 'error')
  const latencies = recentMetrics.filter(m => m.type === 'latency').map(m => m.value)
  const costs = recentMetrics.filter(m => m.type === 'cost')
  const tokens = recentMetrics.filter(m => m.type === 'tokens')
  
  const totalRequests = requests.length
  const errorRate = totalRequests > 0 ? (errors.length / totalRequests) * 100 : 0
  const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0
  const totalCost = costs.reduce((sum, m) => sum + m.value, 0)
  const totalTokens = tokens.reduce((sum, m) => sum + m.value, 0)
  
  const sortedLatencies = [...latencies].sort((a, b) => a - b)
  const p95Index = Math.floor(sortedLatencies.length * 0.95)
  const p99Index = Math.floor(sortedLatencies.length * 0.99)
  const p95Latency = sortedLatencies[p95Index] || 0
  const p99Latency = sortedLatencies[p99Index] || 0
  
  return {
    avgLatency,
    totalRequests,
    errorRate,
    totalCost,
    totalTokens,
    p95Latency,
    p99Latency
  }
}

export function checkDetectionRules(
  rules: DetectionRule[],
  summary: MetricsSummary,
  existingAlerts: Alert[]
): Alert[] {
  const newAlerts: Alert[] = []
  const now = Date.now()
  
  const recentAlertsByRule = new Set(
    existingAlerts
      .filter(a => now - a.timestamp < 60000)
      .map(a => a.ruleId)
  )
  
  for (const rule of rules) {
    if (!rule.enabled || recentAlertsByRule.has(rule.id)) {
      continue
    }
    
    let metricValue: number | undefined
    let metricName: string
    
    switch (rule.metric) {
      case 'avgLatency':
        metricValue = summary.avgLatency
        metricName = 'Average Latency'
        break
      case 'p95Latency':
        metricValue = summary.p95Latency
        metricName = 'P95 Latency'
        break
      case 'p99Latency':
        metricValue = summary.p99Latency
        metricName = 'P99 Latency'
        break
      case 'errorRate':
        metricValue = summary.errorRate
        metricName = 'Error Rate'
        break
      case 'totalCost':
        metricValue = summary.totalCost
        metricName = 'Total Cost'
        break
      case 'totalTokens':
        metricValue = summary.totalTokens
        metricName = 'Total Tokens'
        break
      case 'totalRequests':
        metricValue = summary.totalRequests
        metricName = 'Total Requests'
        break
      default:
        continue
    }
    
    if (metricValue === undefined) continue
    
    let triggered = false
    switch (rule.condition) {
      case 'gt':
        triggered = metricValue > rule.threshold
        break
      case 'gte':
        triggered = metricValue >= rule.threshold
        break
      case 'lt':
        triggered = metricValue < rule.threshold
        break
      case 'lte':
        triggered = metricValue <= rule.threshold
        break
      case 'eq':
        triggered = Math.abs(metricValue - rule.threshold) < 0.01
        break
    }
    
    if (triggered) {
      const alert: Alert = {
        id: `alert_${now}_${Math.random().toString(36).substr(2, 9)}`,
        ruleId: rule.id,
        ruleName: rule.name,
        message: `${metricName} ${rule.condition === 'gt' ? 'exceeded' : rule.condition === 'lt' ? 'below' : 'equals'} threshold: ${metricValue.toFixed(2)} ${rule.condition === 'gt' ? '>' : rule.condition === 'lt' ? '<' : '='} ${rule.threshold}`,
        severity: rule.severity,
        timestamp: now,
        value: metricValue,
        metadata: {
          metric: rule.metric,
          threshold: rule.threshold,
          condition: rule.condition
        },
        acknowledged: false
      }
      newAlerts.push(alert)
    }
  }
  
  return newAlerts
}

export function formatLatency(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`
  }
  return num.toFixed(0)
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

export function getChartData(metrics: TelemetryMetric[], type: string, timeRange: number, points: number = 20) {
  const now = Date.now()
  const cutoff = now - timeRange
  const interval = timeRange / points
  
  const buckets: number[] = new Array(points).fill(0)
  const counts: number[] = new Array(points).fill(0)
  
  const filteredMetrics = metrics.filter(m => m.type === type && m.timestamp >= cutoff)
  
  for (const metric of filteredMetrics) {
    const bucketIndex = Math.floor((metric.timestamp - cutoff) / interval)
    if (bucketIndex >= 0 && bucketIndex < points) {
      buckets[bucketIndex] += metric.value
      counts[bucketIndex]++
    }
  }
  
  return buckets.map((sum, i) => ({
    timestamp: cutoff + (i * interval),
    value: type === 'latency' && counts[i] > 0 ? sum / counts[i] : sum
  }))
}
