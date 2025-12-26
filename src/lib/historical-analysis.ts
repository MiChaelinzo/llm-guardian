import type { TelemetryMetric, MetricsSummary, MetricType } from './types'

  value: number
}
  direction: 'up' | 'down' | 'stable'
  changePercent: number
  significance: 'high' | 'medium' | 'low'
  prediction: number
  significance: 'hig
 

  previous: MetricsSummary
  percentChanges: Record<M
  regressions: MetricType

  timestamp: number
  value: number
}

  metricType: MetricType
  return analyzeTre

  data: Array<{ time
)

      direction: 'stable',
      significance: 'low',
      confidence: 0
  }
  const values = data.ma

  let sumY = 0
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
  const changePercent = ((lastValue - firstValue) / firstValue) * 100

  let direction: 'up' | 'down' | 'stable' = 'stable'
  if (Math.abs(changePercent) > 5) {
    direction = changePercent > 0 ? 'up' : 'down'
  }

  const significance: 'high' | 'medium' | 'low' =
    Math.abs(changePercent) > 20 ? 'high' :
    Math.abs(changePercent) > 10 ? 'medium' : 'low'

  const avgValue = sumY / n
  let sumSquaredDiff = 0
  for (let i = 0; i < n; i++) {
    sumSquaredDiff += Math.pow(values[i] - avgValue, 2)
  }
  const variance = sumSquaredDiff / n
  const confidence = Math.max(0, Math.min(1, 1 - (variance / (avgValue * avgValue))))

  return {
    metric: metricType,
    direction,
    changePercent,
    significance,
    prediction,
    confidence
  }
 

export function compareHistoricalPeriods(
  current: MetricsSummary,
  previous: MetricsSummary
): HistoricalComparison {
  const improvements: MetricType[] = []
  const regressions: MetricType[] = []
  const percentChanges: Record<string, number> = {}

  const metricsToCompare: MetricType[] = [
    'avgLatency',
    'p95Latency',
    'p99Latency',
    'totalCost',
    'totalRequests'
  ]

  metricsToCompare.forEach(metric => {
    const currentValue = current[metric]
    const previousValue = previous[metric]

    if (previousValue !== 0) {
      const change = ((currentValue - previousValue) / previousValue) * 100
      percentChanges[metric] = change

      if (metric === 'totalCost' || metric.includes('Latency')) {
        if (change < -5) improvements.push(metric)
        else if (change > 5) regressions.push(metric)
      } else {
        if (change > 5) improvements.push(metric)
        else if (change < -5) regressions.push(metric)
      }
    }
  })

  return {
    previous,
    current,
    percentChanges: percentChanges as Record<MetricType, number>,
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
    if (trend.significance === 'high') {
      const direction = trend.direction === 'up' ? 'increasing' : 'decreasing'
      insights.push(
        `📊 ${formatMetricName(trend.metric)} is ${direction} significantly (${Math.abs(trend.changePercent).toFixed(1)}%)`
      )
    }
  })

  if (comparison.improvements.length > 0) {
    const improved = comparison.improvements.map(formatMetricName).join(', ')
    insights.push(`✅ Improvements detected in: ${improved}`)
  }

  if (comparison.regressions.length > 0) {
    const regressed = comparison.regressions.map(formatMetricName).join(', ')
    insights.push(`⚠️ Regressions detected in: ${regressed}`)
  }

  const latencyTrend = trends.find(t => t.metric === 'avgLatency')
  if (latencyTrend && latencyTrend.direction === 'up' && latencyTrend.significance === 'high') {
    insights.push('⚠️ Latency spike detected - investigate recent deployments')
  }

  const errorTrend = trends.find(t => t.metric === 'errorRate')
  if (errorTrend && errorTrend.direction === 'up') {
    insights.push('🔴 Error rate increasing - check system health')
  }

  const costTrend = trends.find(t => t.metric === 'totalCost')
  if (costTrend && costTrend.direction === 'up' && costTrend.significance === 'high') {
    insights.push('💰 Cost trend is rising - review usage patterns')
  }

  return insights
}

export function forecastMetric(
  data: Array<{ timestamp: number; value: number }>,
  periodsAhead: number = 5
): ForecastPoint[] {
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
  const avgInterval = data.length > 1 ? (lastTimestamp - data[0].timestamp) / (data.length - 1) : 60000

  const forecasts: ForecastPoint[] = []
  for (let i = 1; i <= periodsAhead; i++) {
    const predictedValue = slope * (n + i) + intercept
    forecasts.push({
      timestamp: lastTimestamp + avgInterval * i,
      predictedValue: Math.max(0, predictedValue),
      confidence: Math.max(0, 1 - (i * 0.15))
    })
  }

  return forecasts
}

function formatMetricName(metric: MetricType): string {
  const names: Record<string, string> = {
    avgLatency: 'Average Latency',
    p95Latency: 'P95 Latency',
): number {

    totalRequests: 'Request Volume',
    errorRate: 'Error Rate'
  }
  return names[metric] || metric
}

export function bucketMetricsByHour(
function formatMetricName(met
  timeRange: number
    p95Latency: 'P95 Latency',
  const buckets = new Map<number, TelemetryMetric[]>()
  const cutoff = Date.now() - timeRange

  return names[metric] || met
    if (metric.timestamp >= cutoff) {
      const hourBucket = Math.floor(metric.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000)
      if (!buckets.has(hourBucket)) {
        buckets.set(hourBucket, [])
      }
      buckets.get(hourBucket)!.push(metric)

    

        buckets.
}

export function detectAnomalies(
  data: Array<{ timestamp: number; value: number }>,
  threshold: number = 2
): number[] {
  if (data.length < 5) return []

  const values = data.map(d => d.value)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  const anomalyIndices: number[] = []
  values.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev)
    if (zScore > threshold) {
      anomalyIndices.push(index)
    }
  })

  return anomalyIndices
}
