import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Sparkle, TrendUp, Clock } from '@phosphor-icons/react'
import type { MetricSummary } from '@/lib/types'

interface AIInsightsProps {
  summary: MetricSummary
  insights: string[]
}

export function AIInsights({ summary, insights }: AIInsightsProps) {
  const getHealthScore = () => {
    const errorScore = summary.errorRate < 1 ? 100 : summary.errorRate < 5 ? 70 : 40
    const latencyScore = summary.avgLatency < 1000 ? 100 : summary.avgLatency < 2000 ? 70 : 40
    return Math.round((errorScore + latencyScore) / 2)
  }

  const healthScore = getHealthScore()

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={24} weight="fill" className="text-primary" />
            <CardTitle>Gemini AI Insights</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <Sparkle size={12} weight="fill" className="text-primary" />
            Google Cloud
          </Badge>
        </div>
        <CardDescription>Real-time intelligent analysis powered by Vertex AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Health Score</span>
              <span className="text-2xl font-bold font-mono">{healthScore}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${healthScore}%`,
                  backgroundColor: healthScore > 80 ? 'var(--success)' : healthScore > 60 ? 'var(--warning)' : 'var(--destructive)'
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {insights.slice(0, 3).map((insight, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-card/50 border border-border/50">
              {insight.includes('increasing') || insight.includes('spike') ? (
                <TrendUp size={16} weight="fill" className="text-warning mt-0.5 flex-shrink-0" />
              ) : insight.includes('latency') ? (
                <Clock size={16} weight="fill" className="text-primary mt-0.5 flex-shrink-0" />
              ) : (
                <Sparkle size={16} weight="fill" className="text-success mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm text-foreground/90">{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
