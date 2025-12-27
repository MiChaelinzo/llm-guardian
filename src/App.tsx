import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartLine, Bell, Lightning, Bug, Waveform, Flask, Brain, Wrench, ChartBar } from '@phosphor-icons/react'
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
import { VoiceButton } from '@/components/VoiceButton'
import { TrendVisualization } from '@/components/TrendVisualization'
import { WebhookTestingPanel } from '@/components/WebhookTestingPanel'
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics'
import { TeamCollaboration } from '@/components/TeamCollaboration'
import { CostOptimizationPanel } from '@/components/CostOptimizationPanel'
import { SmartRemediation } from '@/components/SmartRemediation'
import { ModelBenchmarks } from '@/components/ModelBenchmarks'
import { RealtimeStreamVisualizer } from '@/components/RealtimeStreamVisualizer'
import { TelemetrySimulator } from '@/lib/simulator'
import { processVoiceQuery } from '@/lib/voice'
import { calculateMetrics } from '@/lib/metrics'
import type { TelemetryMetric, DetectionRule, Alert, Incident } from '@/lib/types'

function App() {
  const [metrics, setMetrics] = useKV<TelemetryMetric[]>('telemetry-metrics', [])
  const [rules, setRules] = useKV<DetectionRule[]>('detection-rules', [])
  const [alerts, setAlerts] = useKV<Alert[]>('alerts', [])
  const [incidents, setIncidents] = useKV<Incident[]>('incidents', [])
  const [aiInsights, setAiInsights] = useKV<string[]>('ai-insights', [])
  const [hasSeenOnboarding, setHasSeenOnboarding] = useKV<boolean>('has-seen-onboarding', false)
  const [hasEncryptedStorage, setHasEncryptedStorage] = useState(false)

  const [timeRange, setTimeRange] = useState<number>(15 * 60 * 1000)
  const [lastVoiceResponse, setLastVoiceResponse] = useState<string>('')

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!hasSeenOnboarding) {
        return
      }
    }
    checkOnboarding()
  }, [hasSeenOnboarding])

  useEffect(() => {
    const checkEncryptedStorage = async () => {
      const hasStorage = await window.spark.kv.get('encrypted-credentials')
      setHasEncryptedStorage(!!hasStorage)
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
          description: 'Triggers when average latency exceeds 2 seconds',
          metric: 'avgLatency',
          condition: 'gt',
          threshold: 2000,
          severity: 'warning',
          enabled: true,
          actions: ['alert', 'notify']
        },
        {
          id: 'rule_2',
          name: 'P99 Latency Spike',
          description: 'Triggers when P99 latency exceeds 5 seconds',
          metric: 'p99Latency',
          condition: 'gt',
          threshold: 5000,
          severity: 'critical',
          enabled: true,
          actions: ['alert', 'incident', 'notify']
        },
        {
          id: 'rule_3',
          name: 'High Error Rate',
          description: 'Triggers when error rate exceeds 5%',
          metric: 'errorRate',
          condition: 'gt',
          threshold: 5,
          severity: 'critical',
          enabled: true,
          actions: ['alert', 'incident']
        }
      ]
      setRules(defaultRules)
    }
  }, [rules, setRules])

  useEffect(() => {
    const simulator = new TelemetrySimulator()
    simulator.start((metric) => {
      setMetrics((current) => {
        const updated = [...(current || []), metric]
        const cutoff = Date.now() - 5 * 60 * 1000
        return updated.filter(m => m.timestamp > cutoff)
      })
    })

    return () => simulator.stop()
  }, [setMetrics])

  useEffect(() => {
    if (!metrics || !rules || !alerts) return

    const enabledRules = (rules || []).filter(r => r.enabled)
    const summary = calculateMetrics(metrics, timeRange)
    const newAlerts: Alert[] = []

    enabledRules.forEach((rule) => {
      const currentValue = summary[rule.metric]
      let shouldAlert = false

      switch (rule.condition) {
        case 'gt':
          shouldAlert = currentValue > rule.threshold
          break
        case 'lt':
          shouldAlert = currentValue < rule.threshold
          break
        case 'gte':
          shouldAlert = currentValue >= rule.threshold
          break
        case 'lte':
          shouldAlert = currentValue <= rule.threshold
          break
        case 'eq':
          shouldAlert = currentValue === rule.threshold
          break
      }

      if (shouldAlert) {
        const existingAlert = (alerts || []).find(
          a => a.ruleId === rule.id && !a.acknowledged && Date.now() - a.timestamp < 60000
        )

        if (!existingAlert) {
          const alert: Alert = {
            id: `alert_${Date.now()}_${Math.random()}`,
            ruleId: rule.id,
            ruleName: rule.name,
            message: `${rule.name}: ${rule.description}`,
            severity: rule.severity,
            timestamp: Date.now(),
            value: currentValue,
            acknowledged: false,
            metadata: {
              metric: rule.metric,
              threshold: rule.threshold,
              condition: rule.condition
            }
          }
          newAlerts.push(alert)
        }
      }
    })

    if (newAlerts.length > 0) {
      setAlerts((current) => [...(current || []), ...newAlerts])
      newAlerts.forEach(alert => {
        toast.error(alert.message, {
          duration: 5000
        })

        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(alert.message)
          window.speechSynthesis.speak(utterance)
        }
      })
    }
  }, [metrics, rules, alerts, setAlerts])

  const handleAddRule = useCallback((rule: DetectionRule) => {
    setRules((current) => [...(current || []), rule])
    toast.success('Detection rule created')
  }, [setRules])

  const handleEditRule = useCallback((ruleId: string, updates: Partial<DetectionRule>) => {
    setRules((current) =>
      (current || []).map(r => r.id === ruleId ? { ...r, ...updates } : r)
    )
    toast.success('Rule updated')
  }, [setRules])

  const handleToggleRule = useCallback((ruleId: string) => {
    setRules((current) =>
      (current || []).map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r)
    )
  }, [setRules])

  const handleDeleteRule = useCallback((ruleId: string) => {
    setRules((current) => (current || []).filter(r => r.id !== ruleId))
    toast.success('Rule deleted')
  }, [setRules])

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((current) =>
      (current || []).map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    )
    toast.success('Alert acknowledged')
  }, [setAlerts])

  const handleCreateIncident = useCallback((alertId: string) => {
    const alert = (alerts || []).find(a => a.id === alertId)
    if (!alert) return

    const incident: Incident = {
      id: `incident_${Date.now()}`,
      title: alert.ruleName,
      description: alert.message,
      severity: alert.severity,
      status: 'open',
      createdAt: Date.now(),
      alerts: [alert]
    }
    setIncidents((current) => [...(current || []), incident])
    toast.success('Incident created')
  }, [alerts, setIncidents])

  const handleUpdateIncident = useCallback((incidentId: string, updates: Partial<Incident>) => {
    setIncidents((current) =>
      (current || []).map(i =>
        i.id === incidentId ? { ...i, ...updates } : i
      )
    )
  }, [setIncidents])

  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    try {
      const summary = calculateMetrics(metrics || [], timeRange)
      const response = await processVoiceQuery(
        transcript,
        summary,
        alerts || []
      )
      setLastVoiceResponse(response.text)

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.text)
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      toast.error('Voice query failed')
    }
  }, [metrics, alerts, timeRange])

  const summary = calculateMetrics(metrics || [], timeRange)

  return (
    <>
      {!hasSeenOnboarding && (
        <OnboardingDialog
          onComplete={() => setHasSeenOnboarding(true)}
        />
      )}
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Waveform size={28} weight="bold" className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                VoiceWatch AI
              </h1>
              <p className="text-sm text-muted-foreground">Conversational LLM Observability Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <EncryptionStatus hasEncryptedCredentials={hasEncryptedStorage} />
            <VoiceButton onTranscript={handleVoiceTranscript} />
          </div>
        </header>

        <SponsorBadges />

        {lastVoiceResponse && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30 rounded-lg shadow-lg"
          >
            <div className="flex items-start gap-3">
              <Waveform size={20} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-accent mb-1">Voice Assistant Response</div>
                <p className="text-sm">{lastVoiceResponse}</p>
              </div>
            </div>
          </motion.div>
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <ChartLine size={18} />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Brain size={18} />
              AI Analytics
            </TabsTrigger>
            <TabsTrigger value="remediation" className="gap-2">
              <Wrench size={18} />
              Remediation
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="gap-2">
              <ChartBar size={18} />
              Benchmarks
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell size={18} />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Lightning size={18} />
              Rules
            </TabsTrigger>
            <TabsTrigger value="incidents" className="gap-2">
              <Bug size={18} />
              Incidents
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Flask size={18} />
              Testing
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Waveform size={18} />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <MetricCards summary={summary} />

            <RealtimeStreamVisualizer metrics={metrics || []} />

            <TrendVisualization
              metrics={metrics || []}
              timeRange={timeRange}
              type="latency"
              title="Latency Trend with Forecast"
              color="oklch(0.65 0.19 245)"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricChart
                metrics={metrics || []}
                title="Latency Trend"
                type="latency"
                timeRange={timeRange}
                color="oklch(0.65 0.19 245)"
              />
              <MetricChart
                metrics={metrics || []}
                title="Error Rate"
                type="error"
                timeRange={timeRange}
                color="oklch(0.65 0.22 25)"
              />
              <MetricChart
                metrics={metrics || []}
                title="Cost Over Time"
                type="cost"
                timeRange={timeRange}
                color="oklch(0.68 0.18 305)"
              />
              <MetricChart
                metrics={metrics || []}
                title="Request Volume"
                type="request"
                timeRange={timeRange}
                color="oklch(0.70 0.17 145)"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIInsights
                  summary={summary}
                  insights={aiInsights || []}
                />
              </div>
              <div className="lg:col-span-1">
                <TeamCollaboration />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Advanced AI Analytics</h2>
              <p className="text-muted-foreground">Powered by Google Cloud Gemini for intelligent anomaly detection, predictions, and optimization</p>
            </div>
            <AdvancedAnalytics
              metrics={metrics || []}
              alerts={alerts || []}
            />
            <CostOptimizationPanel metrics={metrics || []} />
          </TabsContent>

          <TabsContent value="remediation" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Smart Remediation Engine</h2>
              <p className="text-muted-foreground">AI-powered automatic fixes and optimization recommendations</p>
            </div>
            <SmartRemediation alerts={alerts || []} />
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Model Performance Benchmarks</h2>
              <p className="text-muted-foreground">Real-time comparison across leading LLM providers</p>
            </div>
            <ModelBenchmarks />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Active Alerts</h2>
              <p className="text-muted-foreground">Real-time monitoring alerts from detection rules</p>
            </div>
            <AlertsList
              alerts={alerts || []}
              onAcknowledge={handleAcknowledgeAlert}
              onCreateIncident={(alert) => handleCreateIncident(alert.id)}
            />
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Detection Rules</h2>
              <p className="text-muted-foreground">Configure threshold alerts and monitoring conditions</p>
            </div>
            <DetectionRules
              rules={rules || []}
              onAddRule={handleAddRule}
              onToggleRule={handleToggleRule}
              onEditRule={handleEditRule}
              onDeleteRule={handleDeleteRule}
            />
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Incident Management</h2>
              <p className="text-muted-foreground">Track and resolve critical issues</p>
            </div>
            <IncidentsList
              incidents={incidents || []}
              onResolve={(incidentId) => handleUpdateIncident(incidentId, { status: 'resolved', resolvedAt: Date.now() })}
            />
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Webhook Integration Testing</h2>
              <p className="text-muted-foreground">Test and validate webhook endpoints in real-time</p>
            </div>
            <WebhookTestingPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Settings</h2>
              <p className="text-muted-foreground">Configure API integrations and platform credentials</p>
            </div>
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default App
