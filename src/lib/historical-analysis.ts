import type { TelemetryMetric, MetricsSummary, MetricType } from './types'

export interface HistoricalSnapshot {
  timestamp: number
  summary: MetricsSummary
  metrics: TelemetryMetric[]
}

export interface TrendAnalysis {
  metric: MetricType
  direction: 'up' | 'down' | 'stable'
  changePercent: number
  significance: 'high' | 'medium' | 'low'
  prediction: number
  confidence: number
}

export interface TimeSeriesPoint {
  timestamp: number
  value: number
  trend?: number
}

export interface HistoricalComparison {
  current: MetricsSummary
  previous: MetricsSummary
  percentChanges: Partial<Record<MetricType, number>>
  improvements: MetricType[]
  regressions: MetricType[]
}

export function analyzeMetricTrend(
  data: TimeSeriesPoint[],
  metricType: MetricType
): TrendAnalysis {
  if (data.length < 2) {
    return {
      metric: metricType,
      direction: 'stable',
      changePercent: 0,
      significance: 'low',
      prediction: data[0]?.value || 0,
      confidence: 0
    }
  }

  const values = data.map(d => d.value)
  const n = values.length

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const prediction = slope * n + intercept

  const firstValue = values[0]
  const lastValue = values[n - 1]
  const changePercent = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0

  let direction: 'up' | 'down' | 'stable' = 'stable'
  if (Math.abs(changePercent) > 5) {
    direction = changePercent > 0 ? 'up' : 'down'
  }

  const variance = values.reduce((sum, val) => {
    const predicted = slope * values.indexOf(val) + intercept
    return sum + Math.pow(val - predicted, 2)
  }, 0) / n

  const significance = variance < 100 ? 'high' : variance < 500 ? 'medium' : 'low'

  const avgValue = sumY / n
  const confidence = avgValue !== 0 ? Math.max(0, Math.min(1, 1 - (Math.sqrt(variance) / avgValue))) : 0

  return {
    metric: metricType,
    direction,
    changePercent,
    significance,
    prediction: Math.max(0, prediction),
    confidence
  }
}

export function calculateMovingAverage(
  data: TimeSeriesPoint[],
  windowSize: number = 5
): TimeSeriesPoint[] {
  if (data.length < windowSize) return data

  return data.map((point, index) => {
    const start = Math.max(0, index - Math.floor(windowSize / 2))
    const end = Math.min(data.length, index + Math.ceil(windowSize / 2))
    const window = data.slice(start, end)
    const avg = window.reduce((sum, p) => sum + p.value, 0) / window.length

    return {
      ...point,
      trend: avg
    }
  })
}

export function detectAnomalies(
  data: TimeSeriesPoint[],
  stdDevThreshold: number = 2
): number[] {
  if (data.length < 3) return []

  const values = data.map(d => d.value)
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  const anomalyIndices: number[] = []

  data.forEach((point, index) => {
    const zScore = Math.abs((point.value - mean) / stdDev)
    if (zScore > stdDevThreshold) {
      anomalyIndices.push(index)
    }
  })

  return anomalyIndices
}

export function compareHistoricalPeriods(
  currentData: MetricsSummary,
  previousData: MetricsSummary
): HistoricalComparison {
  const percentChanges: Partial<Record<MetricType, number>> = {}
  const improvements: MetricType[] = []
  const regressions: MetricType[] = []

  const metricKeys: MetricType[] = [
    'avgLatency',
    'p95Latency',
    'p99Latency',
    'errorRate',
    'totalCost',
    'totalTokens',
    'totalRequests'
  ]

  metricKeys.forEach(key => {
    const current = currentData[key]
    const previous = previousData[key]

    if (previous !== 0) {
      const change = ((current - previous) / previous) * 100
      percentChanges[key] = change

      if (key === 'avgLatency' || key === 'p95Latency' || key === 'p99Latency' || key === 'errorRate' || key === 'totalCost') {
        if (change < -5) improvements.push(key)
        if (change > 5) regressions.push(key)
      } else {
        if (change > 5) improvements.push(key)
        if (change < -5) regressions.push(key)
      }
    }
  })

  return {
    current: currentData,
    previous: previousData,
    percentChanges,
    improvements,
    regressions
  }
}

export function generateInsights(
  trends: TrendAnalysis[],
  comparison: HistoricalComparison
): string[] {
  const insights: string[] = []

  trends.forEach(trend => {
    if (trend.significance === 'high' && Math.abs(trend.changePercent) > 10) {
      const direction = trend.direction === 'up' ? 'increasing' : 'decreasing'
      const metricName = formatMetricName(trend.metric)
      insights.push(
        `${metricName} is ${direction} by ${Math.abs(trend.changePercent).toFixed(1)}% with high confidence`
      )
    }
  })

  if (comparison.improvements.length > 0) {
    const improved = comparison.improvements.map(formatMetricName).join(', ')
    insights.push(`Performance improvements detected in: ${improved}`)
  }

  if (comparison.regressions.length > 0) {
    const regressed = comparison.regressions.map(formatMetricName).join(', ')
    insights.push(`Performance regressions detected in: ${regressed}`)
  }

  const latencyTrend = trends.find(t => t.metric === 'avgLatency')
  if (latencyTrend && latencyTrend.direction === 'up' && latencyTrend.changePercent > 20) {
    insights.push('⚠️ Latency spike detected - investigate recent deployments or traffic patterns')
  }

  const errorTrend = trends.find(t => t.metric === 'errorRate')
  if (errorTrend && errorTrend.direction === 'up' && errorTrend.changePercent > 15) {
    insights.push('⚠️ Error rate increasing - check logs and API health')
  }

  const costTrend = trends.find(t => t.metric === 'totalCost')
  if (costTrend && costTrend.prediction > comparison.current.totalCost * 1.5) {
    insights.push('💰 Cost trajectory suggests 50%+ increase - review token usage and model selection')
  }

  if (insights.length === 0) {
    insights.push('System metrics are stable with no significant trends detected')
  }

  return insights
}

export function forecastMetric(
  data: TimeSeriesPoint[],
  periodsAhead: number = 5
): TimeSeriesPoint[] {
  if (data.length < 2) return []

  const values = data.map(d => d.value)
  const n = values.length

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const lastTimestamp = data[data.length - 1].timestamp
  const timeInterval = data.length > 1 ? (data[data.length - 1].timestamp - data[0].timestamp) / (data.length - 1) : 60000

  const forecast: TimeSeriesPoint[] = []

  for (let i = 1; i <= periodsAhead; i++) {
    const predictedValue = slope * (n + i - 1) + intercept
    forecast.push({
      timestamp: lastTimestamp + (timeInterval * i),
      value: Math.max(0, predictedValue)
    })
  }

  return forecast
}

function formatMetricName(metric: MetricType): string {
  const names: Record<MetricType, string> = {
    avgLatency: 'Average Latency',
    p95Latency: 'P95 Latency',
    p99Latency: 'P99 Latency',
    errorRate: 'Error Rate',
    totalCost: 'Total Cost',
    totalTokens: 'Token Usage',
    totalRequests: 'Request Volume'
  }
  return names[metric] || metric
}

export function aggregateByTimeWindow(
  metrics: TelemetryMetric[],
  windowMinutes: number = 5
): Map<number, TelemetryMetric[]> {
  const windowMs = windowMinutes * 60 * 1000
  const buckets = new Map<number, TelemetryMetric[]>()

  metrics.forEach(metric => {
    const bucketTime = Math.floor(metric.timestamp / windowMs) * windowMs
    if (!buckets.has(bucketTime)) {
      buckets.set(bucketTime, [])
    }
    buckets.get(bucketTime)!.push(metric)
  })

  return buckets
}

export function calculateVolatility(data: TimeSeriesPoint[]): number {
  if (data.length < 2) return 0

  const values = data.map(d => d.value)
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  return mean !== 0 ? (stdDev / mean) * 100 : 0
}
