import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  CurrencyDollar, 
  TrendDown, 
  TrendUp,
  Lightning,
  ChartBar
} from '@phosphor-icons/react'
import type { TelemetryMetric } from '@/lib/types'

interface Props {
  metrics: TelemetryMetric[]
}

interface CostSaving {
  category: string
  currentSpend: number
  projectedSpend: number
  savingsAmount: number
  savingsPercent: number
  recommendation: string
}

export function CostOptimizationPanel({ metrics }: Props) {
  const [totalCost, setTotalCost] = useState(0)
  const [projectedMonthlyCost, setProjectedMonthlyCost] = useState(0)
  const [savings, setSavings] = useState<CostSaving[]>([])
  const [potentialSavings, setPotentialSavings] = useState(0)

  useEffect(() => {
    if (metrics.length === 0) return

    const costMetrics = metrics.filter(m => m.type === 'cost')
    const total = costMetrics.reduce((sum, m) => sum + m.value, 0)
    setTotalCost(total)

    const timeSpanHours = (Date.now() - metrics[0].timestamp) / (1000 * 60 * 60)
    const hourlyRate = timeSpanHours > 0 ? total / timeSpanHours : 0
    const projected = hourlyRate * 24 * 30
    setProjectedMonthlyCost(projected)

    const tokenMetrics = metrics.filter(m => m.type === 'tokens')
    const totalTokens = tokenMetrics.reduce((sum, m) => sum + m.value, 0)
    const avgTokensPerRequest = tokenMetrics.length > 0 ? totalTokens / tokenMetrics.length : 0

    const latencyMetrics = metrics.filter(m => m.type === 'latency')
    const avgLatency = latencyMetrics.length > 0 
      ? latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length 
      : 0

    const errorMetrics = metrics.filter(m => m.type === 'error')
    const errorRate = metrics.length > 0 ? (errorMetrics.length / metrics.length) * 100 : 0

    const calculatedSavings: CostSaving[] = []

    if (avgTokensPerRequest > 1000) {
      const tokensReduction = avgTokensPerRequest * 0.3
      const tokenSavings = (tokensReduction / 1000) * 0.002 * tokenMetrics.length
      calculatedSavings.push({
        category: 'Prompt Optimization',
        currentSpend: total,
        projectedSpend: total - tokenSavings,
        savingsAmount: tokenSavings,
        savingsPercent: (tokenSavings / total) * 100,
        recommendation: 'Reduce prompt length by 30% through better engineering. Use concise instructions and remove redundant context.'
      })
    }

    if (avgLatency > 2000) {
      const cachingSavings = total * 0.25
      calculatedSavings.push({
        category: 'Response Caching',
        currentSpend: total,
        projectedSpend: total - cachingSavings,
        savingsAmount: cachingSavings,
        savingsPercent: 25,
        recommendation: 'Implement semantic caching for similar queries. Estimated 25% of requests can be served from cache.'
      })
    }

    if (errorRate > 3) {
      const retryReduction = total * (errorRate / 100) * 0.5
      calculatedSavings.push({
        category: 'Error Reduction',
        currentSpend: total,
        projectedSpend: total - retryReduction,
        savingsAmount: retryReduction,
        savingsPercent: (retryReduction / total) * 100,
        recommendation: 'Fix error-prone prompts and add better validation. Reduce retry costs from failures.'
      })
    }

    const modelSwitchSavings = total * 0.15
    calculatedSavings.push({
      category: 'Model Selection',
      currentSpend: total,
      projectedSpend: total - modelSwitchSavings,
      savingsAmount: modelSwitchSavings,
      savingsPercent: 15,
      recommendation: 'Use GPT-4o-mini for 60% of requests that don\'t require advanced reasoning. Same quality, lower cost.'
    })

    const batchingSavings = total * 0.10
    calculatedSavings.push({
      category: 'Request Batching',
      currentSpend: total,
      projectedSpend: total - batchingSavings,
      savingsAmount: batchingSavings,
      savingsPercent: 10,
      recommendation: 'Batch similar requests together to reduce API overhead and optimize token usage.'
    })

    setSavings(calculatedSavings)
    const totalPotentialSavings = calculatedSavings.reduce((sum, s) => sum + s.savingsAmount, 0)
    setPotentialSavings(totalPotentialSavings)
  }, [metrics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-cost/10 rounded-lg flex items-center justify-center">
              <CurrencyDollar size={24} weight="duotone" className="text-cost" />
            </div>
            <Badge variant="outline">Current</Badge>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            {formatCurrency(totalCost)}
          </div>
          <p className="text-sm text-muted-foreground">Total spend (session)</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <TrendUp size={24} weight="duotone" className="text-warning" />
            </div>
            <Badge variant="outline">Projected</Badge>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            {formatCurrency(projectedMonthlyCost)}
          </div>
          <p className="text-sm text-muted-foreground">Monthly at current rate</p>
        </Card>

        <Card className="p-6 bg-success/5 border-success/20">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendDown size={24} weight="duotone" className="text-success" />
            </div>
            <Badge className="bg-success text-success-foreground">Savings</Badge>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            {formatCurrency(potentialSavings)}
          </div>
          <p className="text-sm text-muted-foreground">
            Save {((potentialSavings / totalCost) * 100).toFixed(0)}% with optimizations
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Lightning size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Cost Optimization Opportunities</h3>
              <p className="text-sm text-muted-foreground">AI-recommended strategies to reduce LLM costs</p>
            </div>
          </div>
        </div>

        {savings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ChartBar size={48} className="mx-auto mb-3 opacity-50" />
            <p>Collecting data to analyze cost optimization opportunities...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savings.map((saving, idx) => (
              <div
                key={idx}
                className="p-5 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-semibold mb-1">{saving.category}</h4>
                    <p className="text-sm text-muted-foreground">
                      {saving.recommendation}
                    </p>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">
                    -{saving.savingsPercent.toFixed(0)}%
                  </Badge>
                </div>

                <div className="flex items-center gap-6 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Current</div>
                    <div className="text-lg font-semibold font-mono">
                      {formatCurrency(saving.currentSpend)}
                    </div>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">After Optimization</div>
                    <div className="text-lg font-semibold font-mono text-success">
                      {formatCurrency(saving.projectedSpend)}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xs text-muted-foreground mb-1">Monthly Savings</div>
                    <div className="text-lg font-bold font-mono text-success">
                      {formatCurrency((saving.savingsAmount / totalCost) * projectedMonthlyCost)}
                    </div>
                  </div>
                </div>

                <Progress 
                  value={100 - saving.savingsPercent} 
                  className="h-2"
                />
              </div>
            ))}

            <div className="p-5 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Lightning size={24} weight="fill" className="text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-semibold mb-2">Combined Impact</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Implementing all recommended optimizations could reduce your monthly LLM costs from{' '}
                    <span className="font-semibold text-foreground">{formatCurrency(projectedMonthlyCost)}</span>
                    {' '}to approximately{' '}
                    <span className="font-semibold text-success">
                      {formatCurrency(projectedMonthlyCost - (potentialSavings / totalCost) * projectedMonthlyCost)}
                    </span>
                    , saving{' '}
                    <span className="font-bold text-success">
                      {formatCurrency((potentialSavings / totalCost) * projectedMonthlyCost)}
                    </span>
                    {' '}per month.
                  </p>
                  <div className="flex gap-3">
                    <Button size="sm" className="gap-2">
                      <Lightning size={16} />
                      Generate Implementation Plan
                    </Button>
                    <Button size="sm" variant="outline">
                      Export Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
