import { Card } from '@/components/ui/card'
import { getChartData, formatLatency, formatTimestamp } from '@/lib/metrics'
import type { TelemetryMetric } from '@/lib/types'
import { useMemo } from 'react'

interface MetricChartProps {
  metrics: TelemetryMetric[]
  type: 'latency' | 'error' | 'cost' | 'request'
  title: string
  timeRange: number
  color: string
}

export function MetricChart({ metrics, type, title, timeRange, color }: MetricChartProps) {
  const chartData = useMemo(() => {
    return getChartData(metrics, type, timeRange, 30)
  }, [metrics, type, timeRange])

  const maxValue = Math.max(...chartData.map(d => d.value), 1)
  const minValue = Math.min(...chartData.map(d => d.value), 0)
  const range = maxValue - minValue || 1

  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * 100
    const y = 100 - ((d.value - minValue) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="relative h-48 w-full">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          <polyline
            points={`0,100 ${points} 100,100`}
            fill={`url(#gradient-${type})`}
            className="transition-all duration-300"
          />
          
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            className="transition-all duration-300"
          />

          {chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * 100
            const y = 100 - ((d.value - minValue) / range) * 100
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="0.8"
                fill={color}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
        
        <div className="absolute top-0 left-0 text-xs font-mono text-muted-foreground">
          {type === 'latency' ? formatLatency(maxValue) : maxValue.toFixed(2)}
        </div>
        <div className="absolute bottom-0 left-0 text-xs font-mono text-muted-foreground">
          {type === 'latency' ? formatLatency(minValue) : minValue.toFixed(2)}
        </div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{formatTimestamp(chartData[0]?.timestamp || Date.now())}</span>
        <span>{formatTimestamp(chartData[chartData.length - 1]?.timestamp || Date.now())}</span>
      </div>
    </Card>
  )
}
