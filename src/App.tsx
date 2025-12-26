import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartLine, Bell, Lightning, Bug, Waveform } from '@phosphor-icons/react'
import { MetricCards } from '@/components/MetricCards'
import { MetricChart } from '@/components/MetricChart'
import { AIInsights } from '@/components/AIInsights'
import { DetectionRules } from '@/components/DetectionRules'
import { EncryptionStatus } from '@/components/EncryptionStatus'
import { Settings } from '@/components/Settings'
import { AlertsList } from '@/components/AlertsList'
import { IncidentsList } from '@/components/IncidentsList'
import { OnboardingDialog } from '@/components/OnboardingDialog'
import { SponsorBadges } from '@/components/SponsorBadges'
import { ConfluentStream } from '@/components/ConfluentStream'
import { VoiceButton } from '@/components/VoiceButton'
import { HistoricalAnalysis } from '@/components/HistoricalAnalysis'
import { TrendVisualization } from '@/components/TrendVisualization'
import { TelemetrySimulator } from '@/lib/simulator'
import { calculateMetrics } from '@/lib/metrics'
import { processVoiceQuery } from '@/lib/voice'
import type { TelemetryMetric, DetectionRule, Alert, Incident } from '@/lib/types'

function App() {
  const [metrics, setMetrics] = useKV<TelemetryMetric[]>('telemetry-metrics', [])
  const [rules, setRules] = useKV<DetectionRule[]>('detection-rules', [])
  const [alerts, setAlerts] = useKV<Alert[]>('alerts', [])
  const [incidents, setIncidents] = useKV<Incident[]>('incidents', [])
  const [aiInsights, setAiInsights] = useKV<string[]>('ai-insights', [
    'System performance is stable with normal latency patterns'
  ])

  const [activeTab, setActiveTab] = useState('dashboard')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [timeRange, setTimeRange] = useState(5 * 60 * 1000)
  const [hasEncryptedCreds, setHasEncryptedCreds] = useState(false)
  const [lastVoiceResponse, setLastVoiceResponse] = useState<string>('')
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)

  useEffect(() => {
    const checkOnboarding = async () => {
      const hasSeenOnboarding = await window.spark.kv.get('hasSeenOnboarding')
      if (!hasSeenOnboarding) {
        setShowOnboarding(true)
      }
    }
    checkOnboarding()
  }, [])

  const handleOnboardingComplete = async () => {
    await window.spark.kv.set('hasSeenOnboarding', true)
    setShowOnboarding(false)
  }

  useEffect(() => {
    const checkEncryptedStorage = async () => {
      const hasStorage = await window.spark.kv.get('encrypted_credentials')
      setHasEncryptedCreds(!!hasStorage)
    }
    checkEncryptedStorage()
    const interval = setInterval(checkEncryptedStorage, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!rules || rules.length === 0) {
      const defaultRules: DetectionRule[] = [
        {
          id: 'rule_1',
          name: 'High Latency Alert',
          description: 'Triggers when average latency exceeds threshold',
          metric: 'avgLatency',
          condition: 'gt',
          threshold: 500,
          severity: 'warning',
          enabled: true,
          actions: ['alert', 'notify']
        },
        {
          id: 'rule_2',
          name: 'Critical Latency',
          description: 'Triggers when P95 latency is critically high',
          metric: 'p95Latency',
          condition: 'gt',
          threshold: 2000,
          severity: 'critical',
          enabled: true,
          actions: ['alert', 'incident']
        },
        {
          id: 'rule_3',
          name: 'Budget Exceeded',
          description: 'Triggers when costs exceed budget',
          metric: 'totalCost',
          condition: 'gt',
          threshold: 100,
          severity: 'critical',
          enabled: true,
          actions: ['alert', 'incident', 'notify']
        }
      ]
      setRules(defaultRules)
    }
  }, [rules, setRules])

  useEffect(() => {
    const simulator = new TelemetrySimulator()
    simulator.start((newMetric) => {
      setMetrics((current) => {
        const updated = [...(current || []), newMetric]
        const cutoff = Date.now() - 5 * 60 * 1000
        return updated.filter(m => m.timestamp >= cutoff)
      })
    })

    return () => {
      simulator.stop()
    }
  }, [setMetrics])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!metrics || !rules || !alerts) return
      
      const summary = calculateMetrics(metrics, timeRange)
      const enabledRules = rules.filter(r => r.enabled)
      const newAlerts: Alert[] = []

      enabledRules.forEach((rule) => {
        const metricValue = summary[rule.metric]
        let shouldAlert = false

        switch (rule.condition) {
          case 'gt':
            shouldAlert = metricValue > rule.threshold
            break
          case 'lt':
            shouldAlert = metricValue < rule.threshold
            break
          case 'eq':
            shouldAlert = Math.abs(metricValue - rule.threshold) < 0.01
            break
          case 'gte':
            shouldAlert = metricValue >= rule.threshold
            break
          case 'lte':
            shouldAlert = metricValue <= rule.threshold
            break
        }

        if (shouldAlert) {
          const existingAlert = alerts.find(
            a => a.ruleId === rule.id && !a.acknowledged && Date.now() - a.timestamp < 60000
          )

          if (!existingAlert) {
            const alert: Alert = {
              id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              ruleId: rule.id,
              ruleName: rule.name,
              message: `${rule.name}: ${rule.metric} is ${metricValue.toFixed(2)} (threshold: ${rule.threshold})`,
              severity: rule.severity,
              timestamp: Date.now(),
              value: metricValue,
              metadata: {
                metric: rule.metric,
                threshold: rule.threshold,
                condition: rule.condition
              },
              acknowledged: false
            }
            newAlerts.push(alert)
          }
        }
      })

      if (newAlerts.length > 0) {
        setAlerts((current) => [...(current || []), ...newAlerts])
        
        newAlerts.forEach((alert) => {
          toast.error(alert.message, {
            description: `Rule: ${alert.ruleName}`,
            duration: 5000
          })

          if ('speechSynthesis' in window && alert.severity === 'critical') {
            const utterance = new SpeechSynthesisUtterance(
              `Critical alert: ${alert.ruleName}`
            )
            utterance.rate = 1.1
            utterance.pitch = 1
            window.speechSynthesis.speak(utterance)
          }
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [metrics, rules, alerts, setAlerts, timeRange])

  const handleToggleRule = useCallback((ruleId: string) => {
    setRules((current) =>
      (current || []).map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r)
    )
    toast.success('Rule updated')
  }, [setRules])

  const handleAddRule = useCallback((rule: Omit<DetectionRule, 'id'>) => {
    const newRule: DetectionRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setRules((current) => [...(current || []), newRule])
    toast.success('Detection rule added')
  }, [setRules])

  const handleEditRule = useCallback((ruleId: string, updatedRule: Omit<DetectionRule, 'id'>) => {
    setRules((current) =>
      (current || []).map(r => r.id === ruleId ? { ...updatedRule, id: ruleId } : r)
    )
    toast.success('Rule updated successfully')
  }, [setRules])

  const handleDeleteRule = useCallback((ruleId: string) => {
    setRules((current) =>
      (current || []).filter(r => r.id !== ruleId)
    )
    toast.success('Rule deleted')
  }, [setRules])

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((current) =>
      (current || []).map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    )
    toast.success('Alert acknowledged')
  }, [setAlerts])

  const handleCreateIncident = useCallback((alert: Alert) => {
    const incident: Incident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: alert.ruleName,
      description: alert.message,
      severity: alert.severity,
      status: 'open',
      createdAt: Date.now(),
      alerts: [alert]
    }

    setIncidents((current) => [...(current || []), incident])
    handleAcknowledgeAlert(alert.id)
    toast.success('Incident created')
  }, [setIncidents, handleAcknowledgeAlert])

  const handleResolveIncident = useCallback((incidentId: string) => {
    setIncidents((current) =>
      (current || []).map(i => 
        i.id === incidentId 
          ? { ...i, status: 'resolved' as const, resolvedAt: Date.now() }
          : i
      )
    )
    toast.success('Incident marked as resolved')
  }, [setIncidents])

  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    setIsProcessingVoice(true)
    try {
      const response = await processVoiceQuery(
        transcript,
        calculateMetrics(metrics || [], timeRange),
        alerts || []
      )
      setLastVoiceResponse(response.text)
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.text)
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Voice processing error:', error)
      toast.error('Failed to process voice command')
    } finally {
      setIsProcessingVoice(false)
    }
  }, [metrics, alerts, timeRange])

  const summary = calculateMetrics(metrics || [], timeRange)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <OnboardingDialog 
        onComplete={handleOnboardingComplete}
      />

      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Waveform className="text-primary-foreground" size={24} weight="bold" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">VoiceWatch AI</h1>
                <p className="text-sm text-muted-foreground">Conversational LLM Observability</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <EncryptionStatus hasEncryptedCredentials={hasEncryptedCreds} />
              <VoiceButton 
                onTranscript={handleVoiceTranscript}
                isProcessing={isProcessingVoice}
              />
            </div>
          </header>

          <SponsorBadges />

          {lastVoiceResponse && (
            <div className="p-4 bg-accent/20 rounded-lg border border-accent">
              <p className="text-sm font-mono">{lastVoiceResponse}</p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <ChartLine size={16} weight="bold" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell size={16} weight="bold" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Lightning size={16} weight="bold" />
                Rules
              </TabsTrigger>
              <TabsTrigger value="incidents" className="flex items-center gap-2">
                <Bug size={16} weight="bold" />
                Incidents
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Waveform size={16} weight="bold" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Real-Time Telemetry</h2>
                <ConfluentStream metricsCount={(metrics || []).length} />
              </div>

              <MetricCards summary={summary} />

              <HistoricalAnalysis metrics={metrics || []} timeRange={timeRange} />

              <div className="grid gap-6">
                <TrendVisualization
                  metrics={metrics || []}
                  type="latency"
                  title="Latency Trend with Forecast"
                  color="oklch(0.65 0.19 245)"
                  timeRange={timeRange}
                />

                <TrendVisualization
                  metrics={metrics || []}
                  type="error"
                  title="Error Trend with Anomaly Detection"
                  color="oklch(0.65 0.22 25)"
                  timeRange={timeRange}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <MetricChart
                    metrics={metrics || []}
                    type="cost"
                    title="Total Cost"
                    color="oklch(0.68 0.18 305)"
                    timeRange={timeRange}
                  />

                  <MetricChart
                    metrics={metrics || []}
                    type="request"
                    title="Request Rate"
                    color="oklch(0.70 0.17 145)"
                    timeRange={timeRange}
                  />
                </div>
              </div>

              <AIInsights summary={summary} insights={aiInsights || []} />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6 mt-6">
              <div>
                <h2 className="text-2xl font-bold">Active Alerts</h2>
                <p className="text-muted-foreground">Real-time alerts from detection rules</p>
              </div>

              <AlertsList
                alerts={alerts || []}
                onAcknowledge={handleAcknowledgeAlert}
                onCreateIncident={handleCreateIncident}
              />
            </TabsContent>

            <TabsContent value="rules" className="space-y-6 mt-6">
              <div>
                <h2 className="text-2xl font-bold">Detection Rules</h2>
                <p className="text-muted-foreground">Configure threshold alerts for metrics</p>
              </div>

              <DetectionRules
                rules={rules || []}
                onToggleRule={handleToggleRule}
                onAddRule={handleAddRule}
                onEditRule={handleEditRule}
                onDeleteRule={handleDeleteRule}
              />
            </TabsContent>

            <TabsContent value="incidents" className="space-y-6 mt-6">
              <div>
                <h2 className="text-2xl font-bold">Incident Management</h2>
                <p className="text-muted-foreground">Track, investigate, and resolve critical incidents</p>
              </div>

              <IncidentsList
                incidents={incidents || []}
                onResolve={handleResolveIncident}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <Settings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default App
