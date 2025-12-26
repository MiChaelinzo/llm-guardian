import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendUp, TrendDown, Minus, Lightbulb, ChartLine } from '@phosphor-icons/react'
import type { TelemetryMetric, MetricsSummary, MetricType } from '@/lib/types'
import {
  analyzeMetricTrend,
  calculateMovingAverage,
  compareHistoricalPeriods,
  generateInsights,
  forecastMetric,
  calculateVolatility,
  type TimeSeriesPoint,
  type TrendAnalysis
} from '@/lib/historical-analysis'
import { calculateMetrics, getChartData } from '@/lib/metrics'

interface HistoricalAnalysisProps {
  metrics: TelemetryMetric[]
  timeRange: number
}

export function HistoricalAnalysis({ metrics, timeRange }: HistoricalAnalysisProps) {
  const analysis = useMemo(() => {
    if (!metrics || metrics.length < 2) {
      return null
    }

    const now = Date.now()
    const halfRange = timeRange / 2
    const cutoffMid = now - halfRange

    const recentMetrics = metrics.filter(m => m.timestamp >= cutoffMid)
    const olderMetrics = metrics.filter(m => m.timestamp < cutoffMid && m.timestamp >= now - timeRange)

    const currentSummary = calculateMetrics(recentMetrics, halfRange)
    const previousSummary = calculateMetrics(olderMetrics, halfRange)

    const comparison = compareHistoricalPeriods(currentSummary, previousSummary)

    const metricTypes: Array<{ key: MetricType; type: string }> = [
      { key: 'avgLatency', type: 'latency' },
      { key: 'errorRate', type: 'error' },
      { key: 'totalCost', type: 'cost' },
      { key: 'totalRequests', type: 'request' }
    ]

    const trends: TrendAnalysis[] = metricTypes.map(({ key, type }) => {
      const chartData = getChartData(metrics, type, timeRange, 20)
      const points: TimeSeriesPoint[] = chartData.map(d => ({
        timestamp: d.timestamp,
        value: d.value
      }))
      return analyzeMetricTrend(points, key)
    })

    const insights = generateInsights(trends, comparison)

    const latencyData = getChartData(metrics, 'latency', timeRange, 30).map(d => ({
      timestamp: d.timestamp,
      value: d.value
    }))
    const latencyWithTrend = calculateMovingAverage(latencyData, 5)
    const latencyVolatility = calculateVolatility(latencyData)
    const latencyForecast = forecastMetric(latencyData, 5)

    return {
      comparison,
      trends,
      insights,
      latencyWithTrend,
      latencyVolatility,
      latencyForecast
    }
  }, [metrics, timeRange])

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine size={20} weight="bold" />
            Historical Analysis
          </CardTitle>
          <CardDescription>
            Not enough data to generate historical trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keep the application running to collect historical metrics and generate trend analysis.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { comparison, trends, insights, latencyVolatility, latencyForecast } = analysis

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine size={20} weight="bold" />
            Historical Trend Analysis
          </CardTitle>
          <CardDescription>
            Comparing recent performance to previous period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {trends.map(trend => (
              <TrendCard key={trend.metric} trend={trend} comparison={comparison} />
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb size={16} weight="fill" className="text-accent" />
              AI-Generated Insights
            </h4>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg text-sm border border-border"
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-card rounded-lg border border-border">
              <h4 className="text-sm font-semibold mb-2">Latency Volatility</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono">
                  {latencyVolatility.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  coefficient of variation
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {latencyVolatility < 10
                  ? 'Very stable performance'
                  : latencyVolatility < 25
                  ? 'Moderate stability'
                  : 'High variability - investigate inconsistencies'}
              </p>
            </div>

            {latencyForecast.length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h4 className="text-sm font-semibold mb-2">5-Period Forecast</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono">
                    {latencyForecast[latencyForecast.length - 1].value.toFixed(0)}ms
                  </span>
                  <span className="text-xs text-muted-foreground">
                    predicted latency
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on linear regression of recent trends
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface TrendCardProps {
  trend: TrendAnalysis
  comparison: ReturnType<typeof compareHistoricalPeriods>
}

function TrendCard({ trend, comparison }: TrendCardProps) {
  const percentChange = comparison.percentChanges[trend.metric] || 0
  const isImprovement = comparison.improvements.includes(trend.metric)
  const isRegression = comparison.regressions.includes(trend.metric)

  const getTrendIcon = () => {
    if (trend.direction === 'up') return <TrendUp size={16} weight="bold" />
    if (trend.direction === 'down') return <TrendDown size={16} weight="bold" />
    return <Minus size={16} weight="bold" />
  }

  const getTrendColor = () => {
    if (isImprovement) return 'text-success'
    if (isRegression) return 'text-destructive'
    return 'text-muted-foreground'
  }

  const getMetricName = (metric: MetricType): string => {
    const names: Record<MetricType, string> = {
      avgLatency: 'Avg Latency',
      p95Latency: 'P95 Latency',
      p99Latency: 'P99 Latency',
      errorRate: 'Error Rate',
      totalCost: 'Total Cost',
      totalTokens: 'Tokens',
      totalRequests: 'Requests'
    }
    return names[metric] || metric
  }

  const getSignificanceBadge = () => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    }
    return (
      <Badge variant={variants[trend.significance]}>
        {trend.significance} confidence
      </Badge>
    )
  }

  return (
    <div className="p-4 bg-card rounded-lg border border-border space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{getMetricName(trend.metric)}</h4>
        {getTrendIcon()}
      </div>
      <div className="space-y-1">
        <div className={`text-2xl font-bold font-mono ${getTrendColor()}`}>
          {percentChange > 0 && '+'}
          {percentChange.toFixed(1)}%
        </div>
        <p className="text-xs text-muted-foreground">
          {trend.direction === 'stable' ? 'Stable' : `Trending ${trend.direction}`}
        </p>
      </div>
      <div className="pt-2">
        {getSignificanceBadge()}
      </div>
      {isImprovement && (
        <p className="text-xs text-success">✓ Performance improved</p>
      )}
      {isRegression && (
        <p className="text-xs text-destructive">⚠ Performance degraded</p>
      )}
    </div>
  )
}
