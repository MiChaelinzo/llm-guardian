import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Warning, CheckCircle, CurrencyDollar } from '@phosphor-icons/react'
import { formatLatency, formatCost, formatNumber } from '@/lib/metrics'
import type { MetricsSummary } from '@/lib/types'

interface MetricCardProps {
  summary: MetricsSummary
}

export function MetricCards({ summary }: MetricCardProps) {
  const getLatencyStatus = (latency: number) => {
    if (latency > 3000) return { label: 'Critical', color: 'bg-destructive' }
    if (latency > 2000) return { label: 'Warning', color: 'bg-warning' }
    return { label: 'Healthy', color: 'bg-success' }
  }

  const getErrorStatus = (errorRate: number) => {
    if (errorRate > 5) return { label: 'Critical', color: 'bg-destructive' }
    if (errorRate > 2) return { label: 'Warning', color: 'bg-warning' }
    return { label: 'Healthy', color: 'bg-success' }
  }

  const latencyStatus = getLatencyStatus(summary.avgLatency)
  const errorStatus = getErrorStatus(summary.errorRate)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-primary" weight="fill" />
            <h3 className="font-semibold text-sm">Avg Latency</h3>
          </div>
          <Badge className={`${latencyStatus.color} text-xs`}>{latencyStatus.label}</Badge>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold font-mono">{formatLatency(summary.avgLatency)}</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>P95: <span className="font-mono font-medium text-foreground">{formatLatency(summary.p95Latency)}</span></span>
            <span>P99: <span className="font-mono font-medium text-foreground">{formatLatency(summary.p99Latency)}</span></span>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-warning">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Warning size={20} className="text-warning" weight="fill" />
            <h3 className="font-semibold text-sm">Error Rate</h3>
          </div>
          <Badge className={`${errorStatus.color} text-xs`}>{errorStatus.label}</Badge>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold font-mono">{summary.errorRate.toFixed(2)}%</p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(summary.totalRequests)} total requests
          </p>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-cost">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <CurrencyDollar size={20} className="text-cost" weight="fill" />
            <h3 className="font-semibold text-sm">Total Cost</h3>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold font-mono">{formatCost(summary.totalCost)}</p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(summary.totalTokens)} tokens used
          </p>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-success">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-success" weight="fill" />
            <h3 className="font-semibold text-sm">Requests</h3>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold font-mono">{formatNumber(summary.totalRequests)}</p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(summary.totalRequests - (summary.totalRequests * summary.errorRate / 100))} successful
          </p>
        </div>
      </Card>
    </div>
  )
}
