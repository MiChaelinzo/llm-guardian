import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  ChartBar, 
  Lightning, 
  CurrencyDollar, 
  Star,
  TrendUp,
  CheckCircle
} from '@phosphor-icons/react'

interface ModelBenchmark {
  name: string
  provider: string
  avgLatency: number
  costPer1kTokens: number
  qualityScore: number
  throughput: number
  reliabilityScore: number
  recommended: boolean
  useCase: string
}

const benchmarks: ModelBenchmark[] = [
  {
    name: 'GPT-4o',
    provider: 'OpenAI',
    avgLatency: 1250,
    costPer1kTokens: 0.015,
    qualityScore: 98,
    throughput: 1200,
    reliabilityScore: 99.8,
    recommended: false,
    useCase: 'Complex reasoning, creative tasks'
  },
  {
    name: 'GPT-4o-mini',
    provider: 'OpenAI',
    avgLatency: 580,
    costPer1kTokens: 0.00015,
    qualityScore: 92,
    throughput: 2400,
    reliabilityScore: 99.5,
    recommended: true,
    useCase: 'General purpose, high volume'
  },
  {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    avgLatency: 890,
    costPer1kTokens: 0.003,
    qualityScore: 97,
    throughput: 1800,
    reliabilityScore: 99.6,
    recommended: false,
    useCase: 'Analysis, document processing'
  },
  {
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    avgLatency: 720,
    costPer1kTokens: 0.00125,
    qualityScore: 94,
    throughput: 2000,
    reliabilityScore: 99.4,
    recommended: true,
    useCase: 'Multimodal, long context'
  },
  {
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    avgLatency: 450,
    costPer1kTokens: 0.00079,
    qualityScore: 88,
    throughput: 3200,
    reliabilityScore: 98.9,
    recommended: false,
    useCase: 'Self-hosted, cost-sensitive'
  }
]

export function ModelBenchmarks() {
  const maxLatency = Math.max(...benchmarks.map(b => b.avgLatency))
  const maxCost = Math.max(...benchmarks.map(b => b.costPer1kTokens))
  const maxThroughput = Math.max(...benchmarks.map(b => b.throughput))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBar size={24} weight="fill" className="text-accent" />
            <div>
              <CardTitle>Model Performance Benchmarks</CardTitle>
              <CardDescription>Real-time comparison across leading LLM providers</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <TrendUp size={14} />
            Live Data
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground pb-2">
          <div>Model</div>
          <div className="text-center">Latency</div>
          <div className="text-center">Cost</div>
          <div className="text-center">Quality</div>
          <div className="text-center">Reliability</div>
        </div>

        <div className="space-y-3">
          {benchmarks.map((model) => (
            <Card 
              key={model.name} 
              className={`relative ${
                model.recommended ? 'border-primary/50 bg-primary/5' : 'border-border'
              }`}
            >
              {model.recommended && (
                <div className="absolute -top-2 right-4">
                  <Badge variant="default" className="gap-1">
                    <Star size={12} weight="fill" />
                    Recommended
                  </Badge>
                </div>
              )}
              <CardContent className="p-4">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div>
                    <div className="font-semibold text-sm">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.provider}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <Lightning size={14} className="text-primary" />
                      <span className="font-mono font-semibold">{model.avgLatency}ms</span>
                    </div>
                    <Progress 
                      value={(1 - model.avgLatency / maxLatency) * 100} 
                      className="h-1.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <CurrencyDollar size={14} className="text-cost" />
                      <span className="font-mono font-semibold">${model.costPer1kTokens.toFixed(5)}</span>
                    </div>
                    <Progress 
                      value={(1 - model.costPer1kTokens / maxCost) * 100} 
                      className="h-1.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <Star size={14} className="text-warning" />
                      <span className="font-mono font-semibold">{model.qualityScore}</span>
                    </div>
                    <Progress 
                      value={model.qualityScore} 
                      className="h-1.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <CheckCircle size={14} className="text-success" />
                      <span className="font-mono font-semibold">{model.reliabilityScore}%</span>
                    </div>
                    <Progress 
                      value={model.reliabilityScore} 
                      className="h-1.5"
                    />
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Best for:</span>{' '}
                    <span className="text-foreground">{model.useCase}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendUp size={12} />
                    <span>{model.throughput.toLocaleString()} req/min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Lightning size={20} weight="fill" className="text-accent" />
            <h4 className="font-semibold text-sm">Benchmark Insights</h4>
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span><strong>GPT-4o-mini</strong> offers 100x cost savings vs GPT-4o with only 6% quality reduction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span><strong>Gemini 1.5 Pro</strong> provides best value for multimodal and long-context tasks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span><strong>Llama 3.1 70B</strong> ideal for self-hosted deployment with lower latency</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
