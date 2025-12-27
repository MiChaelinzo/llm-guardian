import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Wrench, 
  Play, 
  CheckCircle, 
  Warning, 
  Lightbulb,
  ArrowRight,
  Clock
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { Alert } from '@/lib/types'

interface RemediationAction {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  complexity: 'easy' | 'moderate' | 'complex'
  estimatedTime: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  steps: string[]
}

interface Props {
  alerts: Alert[]
  onRemediate?: (actionId: string) => void
}

export function SmartRemediation({ alerts, onRemediate }: Props) {
  const [actions, setActions] = useState<RemediationAction[]>([
    {
      id: 'cache-optimization',
      title: 'Enable Response Caching',
      description: 'Implement semantic caching to reduce duplicate requests by 40%',
      impact: 'high',
      complexity: 'easy',
      estimatedTime: '2 min',
      status: 'pending',
      steps: [
        'Analyze request patterns',
        'Configure cache TTL settings',
        'Enable Redis cache layer',
        'Validate cache hit rates'
      ]
    },
    {
      id: 'model-downgrade',
      title: 'Switch to GPT-4o-mini',
      description: 'For non-critical requests, save 90% on costs without quality loss',
      impact: 'high',
      complexity: 'easy',
      estimatedTime: '1 min',
      status: 'pending',
      steps: [
        'Identify low-complexity requests',
        'Route to GPT-4o-mini',
        'Monitor quality metrics',
        'Measure cost savings'
      ]
    },
    {
      id: 'rate-limiting',
      title: 'Implement Smart Rate Limiting',
      description: 'Prevent error spikes with adaptive rate limiting',
      impact: 'medium',
      complexity: 'moderate',
      estimatedTime: '5 min',
      status: 'pending',
      steps: [
        'Set base rate limits',
        'Configure burst allowances',
        'Add exponential backoff',
        'Monitor throttled requests'
      ]
    },
    {
      id: 'prompt-optimization',
      title: 'Optimize Prompt Templates',
      description: 'Reduce token usage by 25% with prompt engineering',
      impact: 'high',
      complexity: 'moderate',
      estimatedTime: '10 min',
      status: 'pending',
      steps: [
        'Analyze current prompts',
        'Remove redundant context',
        'Use few-shot examples',
        'A/B test new templates'
      ]
    },
    {
      id: 'error-retry',
      title: 'Add Intelligent Retry Logic',
      description: 'Automatically retry failed requests with exponential backoff',
      impact: 'medium',
      complexity: 'easy',
      estimatedTime: '3 min',
      status: 'pending',
      steps: [
        'Detect transient failures',
        'Configure retry intervals',
        'Add circuit breaker',
        'Log retry patterns'
      ]
    },
    {
      id: 'batch-requests',
      title: 'Batch Similar Requests',
      description: 'Process multiple similar requests together for efficiency',
      impact: 'medium',
      complexity: 'complex',
      estimatedTime: '15 min',
      status: 'pending',
      steps: [
        'Queue incoming requests',
        'Group by similarity',
        'Process in batches',
        'Distribute responses'
      ]
    }
  ])

  const [executingAction, setExecutingAction] = useState<string | null>(null)

  const executeRemediation = async (actionId: string) => {
    setExecutingAction(actionId)
    setActions(prev => prev.map(a => 
      a.id === actionId ? { ...a, status: 'running' as const } : a
    ))

    const action = actions.find(a => a.id === actionId)
    if (!action) return

    for (let i = 0; i < action.steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    setActions(prev => prev.map(a => 
      a.id === actionId ? { ...a, status: 'completed' as const } : a
    ))
    setExecutingAction(null)
    
    toast.success(`${action.title} completed successfully`)
    onRemediate?.(actionId)
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged)

  const impactColors = {
    high: 'text-destructive',
    medium: 'text-warning',
    low: 'text-muted-foreground'
  }

  const complexityColors = {
    easy: 'text-success',
    moderate: 'text-warning',
    complex: 'text-destructive'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench size={24} weight="fill" className="text-primary" />
            <div>
              <CardTitle>Smart Remediation Engine</CardTitle>
              <CardDescription>AI-powered automatic fixes for common issues</CardDescription>
            </div>
          </div>
          {criticalAlerts.length > 0 && (
            <Badge variant="destructive" className="gap-1.5">
              <Warning size={16} weight="fill" />
              {criticalAlerts.length} Critical
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {actions.filter(a => a.status === 'completed').length}/{actions.length}
            </div>
            <div className="text-xs text-muted-foreground">Actions Applied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {actions.filter(a => a.impact === 'high').length}
            </div>
            <div className="text-xs text-muted-foreground">High Impact</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              ~{actions.filter(a => a.status === 'pending').reduce((sum, a) => {
                const mins = parseInt(a.estimatedTime)
                return sum + (isNaN(mins) ? 0 : mins)
              }, 0)}m
            </div>
            <div className="text-xs text-muted-foreground">Est. Setup</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <AnimatePresence>
            {actions.map((action, idx) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`relative overflow-hidden ${
                  action.status === 'completed' ? 'border-success/50 bg-success/5' :
                  action.status === 'running' ? 'border-primary/50 bg-primary/5' :
                  'border-border'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {action.status === 'completed' ? (
                          <CheckCircle size={24} weight="fill" className="text-success" />
                        ) : action.status === 'running' ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Play size={24} weight="fill" className="text-primary" />
                          </motion.div>
                        ) : (
                          <Lightbulb size={24} weight="fill" className="text-warning" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-sm">{action.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {action.description}
                            </p>
                          </div>
                          {action.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => executeRemediation(action.id)}
                              disabled={executingAction !== null}
                              className="flex-shrink-0"
                            >
                              <Play size={16} weight="fill" />
                              Apply
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Impact:</span>
                            <span className={`font-medium ${impactColors[action.impact]}`}>
                              {action.impact}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Complexity:</span>
                            <span className={`font-medium ${complexityColors[action.complexity]}`}>
                              {action.complexity}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span className="text-muted-foreground">{action.estimatedTime}</span>
                          </div>
                        </div>

                        {action.status === 'running' && (
                          <div className="mt-3 space-y-2">
                            {action.steps.map((step, idx) => {
                              const progress = ((idx + 1) / action.steps.length) * 100
                              return (
                                <div key={idx} className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs">
                                    <ArrowRight size={12} />
                                    <span className="text-muted-foreground">{step}</span>
                                  </div>
                                  {idx === action.steps.length - 1 && (
                                    <Progress value={progress} className="h-1" />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {action.status === 'completed' && (
                          <div className="mt-2 text-xs text-success flex items-center gap-1">
                            <CheckCircle size={14} weight="fill" />
                            Successfully applied
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb size={20} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary mb-1">AI Recommendation</p>
              <p className="text-muted-foreground">
                Start with <strong>Enable Response Caching</strong> and <strong>Switch to GPT-4o-mini</strong> 
                for immediate 60-70% cost reduction with minimal effort.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
