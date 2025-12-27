import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  TrendUp, 
  MagnifyingGlass, 
  Lightbulb, 
  Check,
  Warning,
  ChartLineUp,
  Target
} from '@phosphor-icons/react'
import {
  detectAnomalies,
  predictMetrics,
  analyzeRootCause,
  generateOptimizationRecommendations,
  type AnomalyDetection,
  type PredictiveInsight,
  type RootCauseAnalysis
} from '@/lib/google-cloud'
import type { TelemetryMetric, Alert } from '@/lib/types'

interface Props {
  metrics: TelemetryMetric[]
  alerts: Alert[]
}

export function AdvancedAnalytics({ metrics, alerts }: Props) {
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([])
  const [predictions, setPredictions] = useState<PredictiveInsight[]>([])
  const [rootCause, setRootCause] = useState<RootCauseAnalysis | null>(null)
  const [optimizations, setOptimizations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('anomalies')

  const runAnomalyDetection = async () => {
    if (metrics.length < 10) return
    setLoading(true)
    try {
      const aggregatedMetrics = aggregateMetrics(metrics)
      const latencyAnomalies = await detectAnomalies(aggregatedMetrics, ['avgLatency'])
      setAnomalies(latencyAnomalies)
    } catch (error) {
      console.error('Anomaly detection failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const runPredictiveAnalysis = async () => {
    if (metrics.length < 10) return
    setLoading(true)
    try {
      const aggregatedMetrics = aggregateMetrics(metrics)
      const insights = await predictMetrics(
        aggregatedMetrics,
        ['avgLatency', 'errorRate', 'cost', 'totalTokens']
      )
      setPredictions(insights)
    } catch (error) {
      console.error('Predictive analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const runRootCauseAnalysis = async () => {
    if (alerts.length === 0) return
    setLoading(true)
    try {
      const latestAlert = alerts[alerts.length - 1]
      const aggregatedMetrics = aggregateMetrics(metrics)
      const analysis = await analyzeRootCause(
        aggregatedMetrics,
        alerts.map(a => ({
          message: a.message,
          timestamp: a.timestamp,
          severity: a.severity
        }))
      )
      setRootCause(analysis)
    } catch (error) {
      console.error('Root cause analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const runOptimizationAnalysis = async () => {
    if (metrics.length < 10) return
    setLoading(true)
    try {
      const aggregatedMetrics = aggregateMetrics(metrics)
      const recommendations = await generateOptimizationRecommendations(aggregatedMetrics)
      setOptimizations(recommendations)
    } catch (error) {
      console.error('Optimization analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const aggregateMetrics = (rawMetrics: TelemetryMetric[]): Array<{ timestamp: number; [key: string]: number }> => {
    const grouped = new Map<number, {
      latencies: number[]
      errors: number
      costs: number
      tokens: number
      requests: number
    }>()

    rawMetrics.forEach(metric => {
      const timeKey = Math.floor(metric.timestamp / 10000) * 10000
      const existing = grouped.get(timeKey) || {
        latencies: [],
        errors: 0,
        costs: 0,
        tokens: 0,
        requests: 0
      }

      if (metric.type === 'latency') existing.latencies.push(metric.value)
      if (metric.type === 'error') existing.errors++
      if (metric.type === 'cost') existing.costs += metric.value
      if (metric.type === 'tokens') existing.tokens += metric.value
      existing.requests++

      grouped.set(timeKey, existing)
    })

    return Array.from(grouped.entries()).map(([timestamp, data]) => {
      const avgLatency = data.latencies.length > 0
        ? data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length
        : 0
      
      return {
        timestamp,
        avgLatency,
        errorRate: data.requests > 0 ? (data.errors / data.requests) * 100 : 0,
        cost: data.costs,
        totalTokens: data.tokens,
        totalRequests: data.requests
      }
    }).sort((a, b) => a.timestamp - b.timestamp)
  }

  useEffect(() => {
    if (metrics.length >= 20 && anomalies.length === 0) {
      runAnomalyDetection()
    }
  }, [metrics.length])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-destructive text-destructive-foreground'
      case 'medium':
      case 'warning':
        return 'bg-warning text-warning-foreground'
      case 'low':
      case 'info':
        return 'bg-success text-success-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Brain size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI-Powered Analytics</h3>
            <p className="text-sm text-muted-foreground">Google Cloud Gemini Intelligence</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          Active
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="anomalies" className="gap-2">
            <Warning size={16} />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <ChartLineUp size={16} />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="rootcause" className="gap-2">
            <MagnifyingGlass size={16} />
            Root Cause
          </TabsTrigger>
          <TabsTrigger value="optimize" className="gap-2">
            <Target size={16} />
            Optimize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anomalies" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              AI-detected anomalies and outliers in your metrics
            </p>
            <Button
              size="sm"
              onClick={runAnomalyDetection}
              disabled={loading || metrics.length < 10}
            >
              {loading ? 'Analyzing...' : 'Re-scan'}
            </Button>
          </div>

          {anomalies.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Check size={48} className="mx-auto mb-3 opacity-50" />
              <p>No anomalies detected</p>
              <p className="text-xs mt-1">System behavior appears normal</p>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          <div className="space-y-3">
            {anomalies.map((anomaly, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(anomaly.severity)}>
                      {anomaly.severity}
                    </Badge>
                    <span className="text-sm font-medium">{anomaly.metric}</span>
                  </div>
                  <Badge variant="outline">
                    {((anomaly.confidence || 0) * 100).toFixed(0)}% confident
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {anomaly.explanation}
                </p>
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Actual:</span>{' '}
                    <span className="font-mono font-medium">{anomaly.actualValue.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected:</span>{' '}
                    <span className="font-mono font-medium">{anomaly.expectedValue.toFixed(2)}</span>
                  </div>
                  {anomaly.timestamp && (
                    <div>
                      <span className="text-muted-foreground">Time:</span>{' '}
                      <span className="font-mono font-medium">
                        {new Date(anomaly.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              ML-powered predictions for future metric trends
            </p>
            <Button
              size="sm"
              onClick={runPredictiveAnalysis}
              disabled={loading || metrics.length < 10}
            >
              {loading ? 'Analyzing...' : 'Generate'}
            </Button>
          </div>

          {predictions.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendUp size={48} className="mx-auto mb-3 opacity-50" />
              <p>No predictions generated</p>
              <p className="text-xs mt-1">Click Generate to create forecasts</p>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          <div className="space-y-3">
            {predictions.map((prediction, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{prediction.metric}</span>
                      <Badge variant="secondary">{prediction.timeframe}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(prediction.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono">
                      {prediction.predictedValue.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">predicted</div>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex items-start gap-2">
                  <Lightbulb size={16} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Prediction for {prediction.timeframe}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rootcause" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Deep-dive analysis to identify root causes of issues
            </p>
            <Button
              size="sm"
              onClick={runRootCauseAnalysis}
              disabled={loading || alerts.length === 0}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>

          {!rootCause && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <MagnifyingGlass size={48} className="mx-auto mb-3 opacity-50" />
              <p>No analysis performed</p>
              <p className="text-xs mt-1">
                {alerts.length === 0
                  ? 'No alerts to analyze'
                  : 'Click Analyze to investigate alerts'}
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-24 bg-muted/50 rounded-lg animate-pulse" />
            </div>
          )}

          {rootCause && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary text-primary-foreground">Issue</Badge>
                  <span className="text-sm font-medium">{rootCause.primaryCause}</span>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <span className="text-destructive">Primary Cause</span>
                    <Badge variant="outline">
                      {(rootCause.confidence * 100).toFixed(0)}% confident
                    </Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">{rootCause.primaryCause}</p>
                </div>

                {rootCause.contributingFactors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Contributing Factors</h4>
                    <ul className="space-y-1">
                      {rootCause.contributingFactors.map((factor, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-warning mt-1">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {rootCause.suggestedActions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb size={16} className="text-success" />
                      Suggested Actions
                    </h4>
                    <ul className="space-y-2">
                      {rootCause.suggestedActions.map((action, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check size={16} className="text-success mt-0.5 shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              AI-generated recommendations to optimize your LLM application
            </p>
            <Button
              size="sm"
              onClick={runOptimizationAnalysis}
              disabled={loading || metrics.length < 10}
            >
              {loading ? 'Analyzing...' : 'Generate'}
            </Button>
          </div>

          {optimizations.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Target size={48} className="mx-auto mb-3 opacity-50" />
              <p>No recommendations generated</p>
              <p className="text-xs mt-1">Click Generate for optimization insights</p>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          <div className="space-y-3">
            {optimizations.map((recommendation, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border bg-card flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-success">{idx + 1}</span>
                </div>
                <div>
                  <p className="text-sm">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
