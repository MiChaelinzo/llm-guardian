import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightning, TrendUp, TrendDown, CheckCircle } from '@phosphor-icons/react'

export function ThresholdPreview() {
  const examples = [
    {
      name: 'Response Time',
      metric: 'P99 Latency',
      threshold: 3000,
      condition: 'Greater Than',
      severity: 'warning',
      icon: TrendUp,
      color: 'text-warning'
    },
    {
      name: 'Error Budget',
      metric: 'Error Rate',
      threshold: 2,
      condition: 'Greater Than',
      severity: 'critical',
      icon: Lightning,
      color: 'text-destructive'
    },
    {
      name: 'Cost Control',
      metric: 'Total Cost',
      threshold: 10,
      condition: 'Greater or Equal',
      severity: 'warning',
      icon: TrendDown,
      color: 'text-cost'
    },
    {
      name: 'Availability Check',
      metric: 'Total Requests',
      threshold: 100,
      condition: 'Less Than',
      severity: 'info',
      icon: CheckCircle,
      color: 'text-primary'
    }
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {examples.map((example, index) => (
        <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-3">
            <example.icon size={24} weight="duotone" className={example.color} />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">{example.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {example.metric} {example.condition.toLowerCase()} {example.threshold}
              </p>
              <Badge variant="outline" className="text-xs capitalize">
                {example.severity}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
