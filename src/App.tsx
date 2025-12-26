import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { MetricCards } from '@/components/MetricCards'
import { VoiceButton } from '@/components/VoiceButton'
import { MetricChart } from '@/components/MetricChart'
import { AlertsList } from '@/components/AlertsList'
import { AIInsights } from '@/components/AIInsights'
import { Settings } from '@/components/Settings'
import { DetectionRules } from '@/components/DetectionRules'
import { IncidentsList } from '@/components/IncidentsList'
import { EncryptionStatus } from '@/components/EncryptionStatus'
import { OnboardingDialog } from '@/components/OnboardingDialog'
import { SponsorBadges } from '@/components/SponsorBadges'
import { ConfluentStream } from '@/components/ConfluentStream'
import { TelemetrySimulator } from '@/lib/simulator'
import { processVoiceQuery, generateIncidentSuggestion, generateAIInsights } from '@/lib/voice'
import { calculateMetrics, formatTimestamp } from '@/lib/metrics'
import { ChartLine, Bell, Lightning, Bug, Waveform } from '@phosphor-icons/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import type { TelemetryMetric, DetectionRule, Alert, Incident, MetricsSummary } from '@/lib/types'

function App() {
  const [metrics, setMetrics] = useKV<TelemetryMetric[]>('telemetry-metrics', [])
  const [rules, setRules] = useKV<DetectionRule[]>('detection-rules', [])
  const [alerts, setAlerts] = useKV<Alert[]>('active-alerts', [])
  const [incidents, setIncidents] = useKV<Incident[]>('incidents', [])
  const [aiInsights, setAiInsights] = useState<string[]>([
    'System performance is stable with normal latency patterns.',
    'All integrations operational and streaming data.'
  ])
  const [lastVoiceResponse, setLastVoiceResponse] = useState<string>('')
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [timeRange, setTimeRange] = useState(5 * 60 * 1000)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [hasEncryptedCreds, setHasEncryptedCreds] = useState(false)

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
          name: 'High Latency Warning',
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
          name: 'Critical P99 Latency',
          description: 'Triggers when P99 latency indicates performance degradation',
          metric: 'p99Latency',
          condition: 'gt',
          threshold: 2000,
          severity: 'critical',
          enabled: true,
          actions: ['alert', 'incident']
        },
        {
          id: 'rule_3',
          name: 'Error Rate Spike',
          description: 'Triggers when error rate exceeds acceptable threshold',
          metric: 'errorRate',
          condition: 'gt',
          threshold: 5,
          severity: 'critical',
          enabled: true,
          actions: ['alert']
        },
        {
          id: 'rule_4',
          name: 'Budget Alert',
          description: 'Alerts when cost threshold is breached',
          metric: 'totalCost',
          condition: 'gt',
          threshold: 100,
          severity: 'warning',
          enabled: true,
          actions: ['alert', 'notify']
        }
      ]
      setRules(defaultRules)
    }
  }, [rules, setRules])

  useEffect(() => {
    const handleMetric = (newMetric: TelemetryMetric) => {
      setMetrics((current) => {
        const updated = [...(current || []), newMetric]
        const cutoff = Date.now() - 5 * 60 * 1000
        return updated.filter(m => m.timestamp >= cutoff)
      })
    }

    const simulator = new TelemetrySimulator(handleMetric)
    simulator.start()

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
              id: `alert_${Date.now()}_${rule.id}`,
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

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!metrics || !alerts) return
      
      const summary = calculateMetrics(metrics, 5 * 60 * 1000)
      const insights = await generateAIInsights(summary, alerts)
      setAiInsights(insights)
    }, 30000)

    const initInsights = async () => {
      if (metrics && alerts) {
        const summary = calculateMetrics(metrics, 5 * 60 * 1000)
        const insights = await generateAIInsights(summary, alerts)
        setAiInsights(insights)
      }
    }

    initInsights()

    return () => clearInterval(interval)
  }, [metrics, alerts])

  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    setIsProcessingVoice(true)
    setLastVoiceResponse(`You: "${transcript}"`)

    try {
      const summary = calculateMetrics(metrics || [], 5 * 60 * 1000)
      const response = await processVoiceQuery(transcript, summary, alerts || [])

      setLastVoiceResponse(response.text)

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(response.text)
        utterance.rate = 1.1
        utterance.pitch = 1
        window.speechSynthesis.speak(utterance)
      }

      if (response.action === 'show_alerts') {
        setActiveTab('alerts')
      } else if (response.action === 'show_metrics') {
        setActiveTab('dashboard')
      }

      toast.success('Voice command processed', {
        description: response.text
      })
    } catch (error) {
      toast.error('Failed to process voice command')
    } finally {
      setIsProcessingVoice(false)
    }
  }, [metrics, alerts])

  const handleToggleRule = useCallback((ruleId: string) => {
    setRules((current) =>
      (current || []).map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r)
    )
  }, [setRules])

  const handleAddRule = useCallback((rule: Omit<DetectionRule, 'id'>) => {
    const newRule: DetectionRule = {
      ...rule,
      id: `rule_${Date.now()}`
    }
    setRules((current) => [...(current || []), newRule])
    toast.success('Detection rule created')
  }, [setRules])
  
  const handleEditRule = useCallback((ruleId: string, rule: Omit<DetectionRule, 'id'>) => {
    setRules((current) =>
      (current || []).map(r => r.id === ruleId ? { ...r, ...rule } : r)
    )
  }, [setRules])
  
  const handleDeleteRule = useCallback((ruleId: string) => {
    setRules((current) =>
      (current || []).filter(r => r.id !== ruleId)
    )
  }, [setRules])

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((current) =>
      (current || []).map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    )
    toast.success('Alert acknowledged')
  }, [setAlerts])

  const handleCreateIncident = useCallback(async (alert: Alert) => {
    const aiSuggestion = await generateIncidentSuggestion(alert)

    const incident: Incident = {
      id: `incident_${Date.now()}`,
      title: alert.ruleName,
      description: alert.message,
      severity: alert.severity,
      status: 'open',
      createdAt: Date.now(),
      alerts: [alert],
      aiSuggestion
    }

    setIncidents((current) => [...(current || []), incident])
    handleAcknowledgeAlert(alert.id)
    toast.success('Incident created with AI recommendation')
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

  const summary = calculateMetrics(metrics || [], timeRange)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <OnboardingDialog 
        onComplete={() => setShowOnboarding(false)}
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

              <div className="grid gap-6">
                <MetricChart
                  metrics={metrics || []}
                  type="latency"
                  title="Average Latency"
                  color="oklch(0.65 0.19 245)"
                  timeRange={timeRange}
                />

                <MetricChart
                  metrics={metrics || []}
                  type="error"
                  title="Error Count"
                  color="oklch(0.65 0.22 25)"
                  timeRange={timeRange}
                />

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

              <AIInsights summary={summary} insights={aiInsights} />
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
