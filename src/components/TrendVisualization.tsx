import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts'
import type { TelemetryMetric } from '@/lib/types'
import { getChartData } from '@/lib/metrics'
import {
  calculateMovingAverage,
  detectAnomalies,
  forecastMetric,
  type TimeSeriesPoint
} from '@/lib/historical-analysis'

interface TrendVisualizationProps {
  metrics: TelemetryMetric[]
  timeRange: number
  type: 'latency' | 'error' | 'cost' | 'request'
  title: string
  color: string
}

export function TrendVisualization({
  metrics,
  timeRange,
  type,
  title,
  color
}: TrendVisualizationProps) {
  const chartData = useMemo(() => {
    const rawData = getChartData(metrics, type, timeRange, 40)
    const points: TimeSeriesPoint[] = rawData.map(d => ({
      timestamp: d.timestamp,
      value: d.value
    }))

    const withTrend = calculateMovingAverage(points, 7)
    const anomalyIndices = detectAnomalies(points, 2.5)
    const forecast = forecastMetric(points, 8)

    const combined = [
      ...withTrend.map((point, index) => ({
        time: new Date(point.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        value: point.value,
        trend: point.trend,
        isAnomaly: anomalyIndices.includes(index),
        isForecast: false
      })),
      ...forecast.map(point => ({
        time: new Date(point.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        value: undefined,
        trend: undefined,
        forecast: point.value,
        isAnomaly: false,
        isForecast: true
      }))
    ]

    return combined
  }, [metrics, timeRange, type])

  const anomalyCount = chartData.filter(d => d.isAnomaly).length
  const hasForecast = chartData.some(d => d.isForecast)

  const formatValue = (value: number | undefined) => {
    if (value === undefined) return ''
    if (type === 'latency') return `${value.toFixed(0)}ms`
    if (type === 'cost') return `$${value.toFixed(4)}`
    if (type === 'error') return value.toFixed(2)
    return value.toFixed(0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {anomalyCount > 0 && (
            <span className="text-destructive">
              {anomalyCount} anomal{anomalyCount === 1 ? 'y' : 'ies'} detected
            </span>
          )}
          {anomalyCount === 0 && 'No anomalies detected'}
          {hasForecast && ' • Including 8-period forecast'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.03 250)" opacity={0.3} />
            <XAxis
              dataKey="time"
              stroke="oklch(0.65 0.02 250)"
              style={{ fontSize: '12px' }}
              tickFormatter={(value, index) => (index % 4 === 0 ? value : '')}
            />
            <YAxis
              stroke="oklch(0.65 0.02 250)"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatValue(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.18 0.03 250)',
                border: '1px solid oklch(0.30 0.03 250)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return [formatValue(value), '']
                }
                return ['', '']
              }}
              labelStyle={{ color: 'oklch(0.98 0 0)' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${type})`}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="trend"
              stroke="oklch(0.55 0.15 280)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Trend (MA)"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="oklch(0.65 0.19 245)"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
              name="Forecast"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
