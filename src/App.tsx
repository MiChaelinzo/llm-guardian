import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { VoiceButton } from '@/components/VoiceButton'
import { MetricCards } from '@/components/MetricCards'
import { MetricChart } from '@/components/MetricChart'
import { AlertsList } from '@/components/AlertsList'
import { DetectionRules } from '@/components/DetectionRules'
import { IncidentsList } from '@/components/IncidentsList'
import { SponsorBadges } from '@/components/SponsorBadges'
import { AIInsights } from '@/components/AIInsights'
import { ConfluentStream } from '@/components/ConfluentStream'
import { Settings } from '@/components/Settings'
import { OnboardingDialog } from '@/components/OnboardingDialog'
import { EncryptionStatus } from '@/components/EncryptionStatus'
import { TelemetrySimulator } from '@/lib/simulator'
import { calculateMetrics, checkDetectionRules } from '@/lib/metrics'
import { processVoiceQuery, generateIncidentSuggestion, generateAIInsights } from '@/lib/voice'
import type { TelemetryMetric, DetectionRule, Alert, Incident } from '@/lib/types'
import { ChartLine, Bell, Lightning, Bug, Waveform, Gear } from '@phosphor-icons/react'

function App() {
  const [metrics, setMetrics] = useKV<TelemetryMetric[]>('telemetry-metrics', [])
  const [rules, setRules] = useKV<DetectionRule[]>('detection-rules', [])
  const [alerts, setAlerts] = useKV<Alert[]>('alerts', [])
  const [incidents, setIncidents] = useKV<Incident[]>('incidents', [])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [lastVoiceResponse, setLastVoiceResponse] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [aiInsights, setAiInsights] = useState<string[]>([
    'System performance is stable with normal latency patterns.',
    'Monitoring active across all telemetry streams.',
    'All integrations operational and streaming data.'
  ])
  const [hasEncryptedCreds, setHasEncryptedCreds] = useState(false)

  useEffect(() => {
    const checkEncryptedStorage = () => {
      const hasSecure = localStorage.getItem('secure_api-config') !== null
      setHasEncryptedCreds(hasSecure)
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
          name: 'High Average Latency',
          description: 'Triggers when average latency exceeds 2000ms',
          metric: 'avgLatency',
          condition: 'gt',
          threshold: 2000,
          severity: 'warning',
          enabled: true,
          actions: ['alert', 'notify']
        },
        {
          id: 'rule_2',
          name: 'Critical P99 Latency',
          description: 'Triggers when P99 latency exceeds 4000ms',
          metric: 'p99Latency',
          condition: 'gt',
          threshold: 4000,
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
        },
        {
          id: 'rule_4',
          name: 'Budget Alert',
          description: 'Triggers when total cost exceeds $1',
          metric: 'totalCost',
          condition: 'gt',
          threshold: 1,
          severity: 'warning',
          enabled: true,
          actions: ['alert']
        }
      ]
      setRules(defaultRules)
    }
  }, [rules, setRules])

  useEffect(() => {
    const simulator = new TelemetrySimulator((metric) => {
      setMetrics((current) => {
        const updated = [...(current || []), metric]
        const cutoff = Date.now() - 5 * 60 * 1000
        return updated.filter(m => m.timestamp >= cutoff)
      })
    })

    simulator.start()

    return () => {
      simulator.stop()
    }
  }, [setMetrics])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!metrics || !rules || !alerts) return
      
      const summary = calculateMetrics(metrics, 5 * 60 * 1000)
      const newAlerts = checkDetectionRules(rules, summary, alerts)

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
  }, [metrics, rules, alerts, setAlerts])

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
    setActiveTab('incidents')
  }, [setIncidents, handleAcknowledgeAlert])

  const handleResolveIncident = useCallback((incidentId: string) => {
    setIncidents((current) =>
      (current || []).map(i => {
        if (i.id === incidentId) {
          if (i.status === 'open') {
            toast.success('Investigation started')
            return { ...i, status: 'investigating' as const }
          } else if (i.status === 'investigating') {
            toast.success('Incident resolved')
            return { ...i, status: 'resolved' as const, resolvedAt: Date.now() }
          }
        }
        return i
      })
    )
  }, [setIncidents])

  const summary = calculateMetrics(metrics || [], 5 * 60 * 1000)
  const timeRange = 5 * 60 * 1000

  return (
    <div className="min-h-screen bg-background">
      <OnboardingDialog onComplete={() => setShowOnboarding(false)} />
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        
        <div className="relative">
          <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
            <div className="container mx-auto px-6 py-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Waveform size={32} weight="fill" className="text-accent" />
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">VoiceWatch AI</h1>
                    <p className="text-sm text-muted-foreground">Conversational LLM Observability</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <EncryptionStatus hasEncryptedCredentials={hasEncryptedCreds} />
                  {lastVoiceResponse && (
                    <div className="max-w-md p-3 rounded-lg bg-card border border-accent/30 text-sm flex items-start gap-2">
                      <Waveform size={16} weight="fill" className="text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">ElevenLabs Voice Agent</div>
                        {lastVoiceResponse}
                      </div>
                    </div>
                  )}
                  <VoiceButton
                    onTranscript={handleVoiceTranscript}
                    isProcessing={isProcessingVoice}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Powered by:</span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">Google Cloud</span>
                <span className="px-2 py-0.5 rounded bg-cost/10 text-cost font-medium">Datadog</span>
                <span className="px-2 py-0.5 rounded bg-success/10 text-success font-medium">Confluent</span>
                <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-medium">ElevenLabs</span>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-6 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="dashboard" className="gap-2">
                  <ChartLine size={16} weight="fill" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="alerts" className="gap-2">
                  <Bell size={16} weight="fill" />
                  Alerts
                  {(alerts || []).filter(a => !a.acknowledged).length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                      {(alerts || []).filter(a => !a.acknowledged).length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="rules" className="gap-2">
                  <Lightning size={16} weight="fill" />
                  Detection Rules
                </TabsTrigger>
                <TabsTrigger value="incidents" className="gap-2">
                  <Bug size={16} weight="fill" />
                  Incidents
                  {(incidents || []).filter(i => i.status !== 'resolved').length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-warning text-warning-foreground">
                      {(incidents || []).filter(i => i.status !== 'resolved').length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Gear size={16} weight="fill" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <SponsorBadges />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <MetricCards summary={summary} />
                  </div>
                  <ConfluentStream metricsCount={(metrics || []).length} />
                </div>

                <AIInsights summary={summary} insights={aiInsights} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MetricChart
                    metrics={metrics || []}
                    type="latency"
                    title="Latency Over Time"
                    timeRange={timeRange}
                    color="oklch(0.65 0.19 245)"
                  />
                  <MetricChart
                    metrics={metrics || []}
                    type="error"
                    title="Error Count"
                    timeRange={timeRange}
                    color="oklch(0.65 0.22 25)"
                  />
                  <MetricChart
                    metrics={metrics || []}
                    type="cost"
                    title="Cost Accumulation"
                    timeRange={timeRange}
                    color="oklch(0.68 0.18 305)"
                  />
                  <MetricChart
                    metrics={metrics || []}
                    type="request"
                    title="Request Rate"
                    timeRange={timeRange}
                    color="oklch(0.70 0.17 145)"
                  />
                </div>
              </TabsContent>

              <TabsContent value="alerts">
                <AlertsList
                  alerts={alerts || []}
                  onAcknowledge={handleAcknowledgeAlert}
                  onCreateIncident={handleCreateIncident}
                />
              </TabsContent>

              <TabsContent value="rules">
                <DetectionRules
                  rules={rules || []}
                  onToggleRule={handleToggleRule}
                  onAddRule={handleAddRule}
                />
              </TabsContent>

              <TabsContent value="incidents">
                <IncidentsList
                  incidents={incidents || []}
                  onResolve={handleResolveIncident}
                />
              </TabsContent>

              <TabsContent value="settings">
                <Settings />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App