import { useState, useEffect, useCallback, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartLine, Bell, Lightning, Bug, Waveform, Flask, Brain, Wrench, ChartBar, Users, SignOut, Target, Gear, FileCode } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MetricCards } from '@/components/MetricCards'
import { MetricChart } from '@/components/MetricChart'
import { AIInsights } from '@/components/AIInsights'
import { DetectionRules } from '@/components/DetectionRules'
import { EncryptionStatus } from '@/components/EncryptionStatus'
import { Settings } from '@/components/Settings'
import { AlertsList } from '@/components/AlertsList'
import { IncidentsList } from '@/components/IncidentsList'
import { OnboardingDialog } from '@/components/OnboardingDialog'
import { LoginPage } from '@/components/LoginPage'
import { SponsorBadges } from '@/components/SponsorBadges'
import { VoiceButton } from '@/components/VoiceButton'
import { TrendVisualization } from '@/components/TrendVisualization'
import { WebhookTestingPanel } from '@/components/WebhookTestingPanel'
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics'
import { TeamCollaboration } from '@/components/TeamCollaboration'
import { TeamChatPanel } from '@/components/TeamChatPanel'
import { CostOptimizationPanel } from '@/components/CostOptimizationPanel'
import { SmartRemediation } from '@/components/SmartRemediation'
import { ModelBenchmarks } from '@/components/ModelBenchmarks'
import { RealtimeStreamVisualizer } from '@/components/RealtimeStreamVisualizer'
import { RateLimitIndicator } from '@/components/RateLimitIndicator'
import { RealtimeCollaboration } from '@/components/RealtimeCollaboration'
import { PresenceIndicator } from '@/components/PresenceIndicator'
import { CollaborativeCursors } from '@/components/CollaborativeCursors'
import { SLOManager } from '@/components/SLOManager'
import { AdvancedFilters } from '@/components/AdvancedFilters'
import { NotificationPreferences } from '@/components/NotificationPreferences'
import { ConfigExportImport } from '@/components/ConfigExportImport'
import { useAuth } from '@/hooks/use-auth'
import { useCollaboration } from '@/hooks/use-collaboration'
import { useAutoCapture } from '@/hooks/use-auto-capture'
import { useDigestScheduler } from '@/hooks/use-digest-scheduler'
import { TelemetrySimulator } from '@/lib/simulator'
import { processVoiceQuery } from '@/lib/voice'
import { calculateMetrics } from '@/lib/metrics'
import { emailNotificationService } from '@/lib/email-notifications'
import { sendWebhook } from '@/lib/webhooks'
import type { TelemetryMetric, DetectionRule, Alert, Incident, FileAttachment, EmailNotificationConfig, EmailNotificationLog, WebhookConfig, SLO, NotificationPreference } from '@/lib/types'

function App() {
  const { user: authUser, isLoading: authLoading, isAuthenticated, hasCheckedAuth, login, logout } = useAuth()
  
  const [metrics, setMetrics] = useKV<TelemetryMetric[]>('telemetry-metrics', [])
  const [rules, setRules] = useKV<DetectionRule[]>('detection-rules', [])
  const [alerts, setAlerts] = useKV<Alert[]>('alerts', [])
  const [slos, setSLOs] = useKV<SLO[]>('slos', [])
  const [alertFilters, setAlertFilters] = useState<any>({})
  const [incidentFilters, setIncidentFilters] = useState<any>({})
  const [notificationPreferences, setNotificationPreferences] = useKV<NotificationPreference>('notification-preferences', {
    id: 'default',
    userId: 'default',
    channels: {
      email: true,
      webhook: true,
      voice: true,
      inApp: true,
    },
    severityThreshold: 'info',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    grouping: {
      enabled: false,
      windowMinutes: 5,
    },
  })
  const [incidents, setIncidents] = useKV<Incident[]>('incidents', [])
  const [aiInsights, setAiInsights] = useKV<string[]>('ai-insights', [])
  const [hasSeenOnboarding, setHasSeenOnboarding] = useKV<boolean>('has-seen-onboarding-v3', false)
  const [emailConfigs] = useKV<EmailNotificationConfig[]>('email-notification-configs', [])
  const [, setEmailLogs] = useKV<EmailNotificationLog[]>('email-notification-logs', [])
  const [webhooks] = useKV<WebhookConfig[]>('webhooks', [])
  const [hasEncryptedStorage, setHasEncryptedStorage] = useState(false)
  const [isKVLoaded, setIsKVLoaded] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar: string } | null>(null)

  const [timeRange, setTimeRange] = useState<number>(15 * 60 * 1000)
  const [lastVoiceResponse, setLastVoiceResponse] = useState<string>('')

  const { broadcastEvent } = useCollaboration(currentUser?.id || '')

  useAutoCapture({
    alerts: alerts || [],
    incidents: incidents || [],
    userId: currentUser?.id || '',
    userName: currentUser?.name || '',
    onCapture: (incidentId, attachment) => {
      setIncidents((current) =>
        (current || []).map(i =>
          i.id === incidentId
            ? { ...i, attachments: [...(i.attachments || []), attachment] }
            : i
        )
      )
    },
  })

  useDigestScheduler({
    incidents: incidents || [],
    alerts: alerts || [],
    metrics: metrics || []
  })

  useEffect(() => {
    if (authUser) {
      setCurrentUser({
        id: authUser.id,
        name: authUser.login,
        avatar: authUser.avatarUrl,
      })
    }
  }, [authUser])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsKVLoaded(true)
      if (isAuthenticated && !hasSeenOnboarding) {
        setTimeout(() => {
          setShowOnboarding(true)
        }, 1000)
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [hasSeenOnboarding, isAuthenticated])

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
      newAlerts.forEach(async (alert) => {
        toast.error(alert.message, {
          duration: 5000
        })

        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(alert.message)
          window.speechSynthesis.speak(utterance)
        }

        if (webhooks && webhooks.length > 0) {
          const enabledWebhooks = webhooks.filter(w => w.enabled)
          for (const webhook of enabledWebhooks) {
            try {
              await sendWebhook(webhook, alert)
            } catch (error) {
              console.error(`Failed to send webhook to ${webhook.name}:`, error)
            }
          }
        }

        if (emailConfigs && emailConfigs.length > 0 && alert.severity === 'critical') {
          try {
            const logs = await emailNotificationService.notifyAlert(alert, emailConfigs)
            setEmailLogs((current) => [...logs, ...(current || [])].slice(0, 100))
          } catch (error) {
            console.error('Failed to send email notification for alert:', error)
          }
        }
      })
    }
  }, [metrics, rules, alerts, setAlerts, emailConfigs, setEmailLogs, webhooks])

  const handleAddRule = useCallback((rule: DetectionRule) => {
    setRules((current) => [...(current || []), rule])
    toast.success('Detection rule created')
    if (currentUser) {
      broadcastEvent({
        type: 'rule_created',
        userId: currentUser.id,
        ruleName: rule.name,
      })
    }
  }, [setRules, currentUser, broadcastEvent])

  const handleEditRule = useCallback((ruleId: string, updates: Partial<DetectionRule>) => {
    setRules((current) =>
      (current || []).map(r => r.id === ruleId ? { ...r, ...updates } : r)
    )
    toast.success('Rule updated')
    const rule = (rules || []).find(r => r.id === ruleId)
    if (currentUser && rule) {
      broadcastEvent({
        type: 'rule_updated',
        userId: currentUser.id,
        ruleName: rule.name,
      })
    }
  }, [setRules, rules, currentUser, broadcastEvent])

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
    if (currentUser) {
      broadcastEvent({
        type: 'alert_acknowledged',
        userId: currentUser.id,
        alertId,
      })
    }
  }, [setAlerts, currentUser, broadcastEvent])

  const handleCreateIncident = useCallback(async (alertId: string) => {
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

    if (emailConfigs && emailConfigs.length > 0) {
      try {
        const logs = await emailNotificationService.notifyIncidentCreated(incident, emailConfigs)
        setEmailLogs((current) => [...logs, ...(current || [])].slice(0, 100))
        const successCount = logs.filter(l => l.status === 'sent').length
        if (successCount > 0) {
          toast.success(`Email notifications sent to ${successCount} recipient${successCount > 1 ? 's' : ''}`)
        }
      } catch (error) {
        console.error('Failed to send email notifications:', error)
      }
    }
  }, [alerts, setIncidents, emailConfigs, setEmailLogs])

  const handleUpdateIncident = useCallback(async (incidentId: string, updates: Partial<Incident>) => {
    const incident = (incidents || []).find(i => i.id === incidentId)
    
    setIncidents((current) =>
      (current || []).map(i =>
        i.id === incidentId ? { ...i, ...updates } : i
      )
    )
    
    if (updates.status === 'resolved' && currentUser) {
      broadcastEvent({
        type: 'incident_resolved',
        userId: currentUser.id,
        incidentId,
      })

      if (incident && emailConfigs && emailConfigs.length > 0) {
        try {
          const updatedIncident = { ...incident, ...updates }
          const logs = await emailNotificationService.notifyIncidentResolved(updatedIncident, emailConfigs)
          setEmailLogs((current) => [...logs, ...(current || [])].slice(0, 100))
          const successCount = logs.filter(l => l.status === 'sent').length
          if (successCount > 0) {
            toast.success(`Resolution notifications sent to ${successCount} recipient${successCount > 1 ? 's' : ''}`)
          }
        } catch (error) {
          console.error('Failed to send email notifications:', error)
        }
      }
    }
  }, [setIncidents, incidents, currentUser, broadcastEvent, emailConfigs, setEmailLogs])

  const handleAddAttachment = useCallback((incidentId: string, file: FileAttachment) => {
    setIncidents((current) =>
      (current || []).map(i =>
        i.id === incidentId ? { ...i, attachments: [...(i.attachments || []), file] } : i
      )
    )
    toast.success('File attached to incident')
    if (currentUser) {
      broadcastEvent({
        type: 'comment_added',
        userId: currentUser.id,
        entityId: incidentId,
        comment: `Attached file: ${file.name}`,
        timestamp: Date.now(),
      })
    }
  }, [setIncidents, currentUser, broadcastEvent])

  const handleRemoveAttachment = useCallback((incidentId: string, fileId: string) => {
    setIncidents((current) =>
      (current || []).map(i =>
        i.id === incidentId ? { 
          ...i, 
          attachments: (i.attachments || []).filter(f => f.id !== fileId) 
        } : i
      )
    )
    toast.success('File removed from incident')
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
      console.error('Voice query error:', error)
      if (error instanceof Error && error.message.includes('Rate limit')) {
        toast.error('AI temporarily unavailable. Please try again in a moment.')
        setLastVoiceResponse('AI features are temporarily rate limited. Your query has been noted.')
      } else {
        toast.error('Voice query failed')
      }
    }
  }, [metrics, alerts, timeRange])

  const handleConfigImport = useCallback((config: {
    rules?: DetectionRule[]
    slos?: SLO[]
    webhooks?: WebhookConfig[]
    preferences?: NotificationPreference
  }) => {
    if (config.rules) {
      setRules((current) => [...(current || []), ...config.rules!])
    }
    if (config.slos) {
      setSLOs((current) => [...(current || []), ...config.slos!])
    }
    if (config.preferences) {
      setNotificationPreferences(config.preferences)
    }
  }, [setRules, setSLOs, setNotificationPreferences])

  const filteredAlerts = useMemo(() => {
    let filtered = alerts || []
    
    if (alertFilters.severity?.length > 0) {
      filtered = filtered.filter(a => alertFilters.severity.includes(a.severity))
    }
    
    if (alertFilters.searchQuery) {
      const query = alertFilters.searchQuery.toLowerCase()
      filtered = filtered.filter(a => 
        a.message.toLowerCase().includes(query) || 
        a.ruleName.toLowerCase().includes(query)
      )
    }
    
    if (alertFilters.timeRange) {
      const cutoff = Date.now() - alertFilters.timeRange
      filtered = filtered.filter(a => a.timestamp > cutoff)
    }
    
    return filtered
  }, [alerts, alertFilters])

  const filteredIncidents = useMemo(() => {
    let filtered = incidents || []
    
    if (incidentFilters.severity?.length > 0) {
      filtered = filtered.filter(i => incidentFilters.severity.includes(i.severity))
    }
    
    if (incidentFilters.status?.length > 0) {
      filtered = filtered.filter(i => incidentFilters.status.includes(i.status))
    }
    
    if (incidentFilters.searchQuery) {
      const query = incidentFilters.searchQuery.toLowerCase()
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(query) || 
        i.description.toLowerCase().includes(query)
      )
    }
    
    if (incidentFilters.timeRange) {
      const cutoff = Date.now() - incidentFilters.timeRange
      filtered = filtered.filter(i => i.createdAt > cutoff)
    }
    
    return filtered
  }, [incidents, incidentFilters])

  const summary = calculateMetrics(metrics || [], timeRange)

  if (authLoading || !isKVLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Waveform size={64} weight="fill" className="text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading VoiceWatch AI...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !hasCheckedAuth) {
    return <LoginPage onLogin={login} isLoading={authLoading} />
  }

  return (
    <>
      {currentUser && <CollaborativeCursors userId={currentUser.id} />}
      {showOnboarding && (
        <OnboardingDialog
          onComplete={() => {
            setShowOnboarding(false)
            setHasSeenOnboarding(true)
          }}
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

          <div className="flex items-center gap-3 flex-wrap">
            {authUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={authUser.avatarUrl} />
                  <AvatarFallback>{authUser.login[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{authUser.login}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="h-6 w-6 p-0"
                  title="Sign out"
                >
                  <SignOut size={14} />
                </Button>
              </div>
            )}
            {currentUser && <PresenceIndicator userId={currentUser.id} />}
            <RateLimitIndicator />
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
            <TabsTrigger value="collaboration" className="gap-2">
              <Users size={18} />
              Collaboration
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
            <TabsTrigger value="slo" className="gap-2">
              <Target size={18} />
              SLO
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Gear size={18} />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2">
              <FileCode size={18} />
              Config
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

          <TabsContent value="collaboration" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Real-Time Collaboration</h2>
              <p className="text-muted-foreground">Multi-user monitoring with WebSocket support and team chat for distributed teams</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {currentUser && (
                  <RealtimeCollaboration
                    userId={currentUser.id}
                    userName={currentUser.name}
                  />
                )}
              </div>
              <div>
                {currentUser && (
                  <TeamChatPanel
                    incidents={incidents || []}
                    currentUserId={currentUser.id}
                    currentUserName={currentUser.name}
                    currentUserAvatar={currentUser.avatar}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Active Alerts</h2>
                <p className="text-muted-foreground">Real-time monitoring alerts from detection rules</p>
              </div>
              <AdvancedFilters
                type="alert"
                filters={alertFilters}
                onFiltersChange={setAlertFilters}
              />
            </div>
            <AlertsList
              alerts={filteredAlerts || []}
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Incident Management</h2>
                <p className="text-muted-foreground">Track and resolve critical issues with team chat and file sharing</p>
              </div>
              <AdvancedFilters
                type="incident"
                filters={incidentFilters}
                onFiltersChange={setIncidentFilters}
              />
            </div>
            <IncidentsList
              incidents={filteredIncidents || []}
              onResolve={(incidentId) => handleUpdateIncident(incidentId, { status: 'resolved', resolvedAt: Date.now() })}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              currentUserId={currentUser?.id}
              currentUserName={currentUser?.name}
              currentUserAvatar={currentUser?.avatar}
            />
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Webhook Integration Testing</h2>
              <p className="text-muted-foreground">Test and validate webhook endpoints in real-time</p>
            </div>
            <WebhookTestingPanel />
          </TabsContent>

          <TabsContent value="slo" className="space-y-4">
            <SLOManager
              slos={slos || []}
              onAddSLO={(slo) => setSLOs((current) => [...(current || []), slo])}
              onToggleSLO={(id) => setSLOs((current) => (current || []).map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))}
              onDeleteSLO={(id) => setSLOs((current) => (current || []).filter(s => s.id !== id))}
              summary={summary}
            />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <NotificationPreferences
              preferences={notificationPreferences || {
                id: 'default',
                userId: 'default',
                channels: { email: true, webhook: true, voice: true, inApp: true },
                severityThreshold: 'info',
                quietHours: { enabled: false, start: '22:00', end: '08:00' },
                grouping: { enabled: false, windowMinutes: 5 },
              }}
              onUpdate={setNotificationPreferences}
            />
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <ConfigExportImport
              rules={rules || []}
              slos={slos || []}
              webhooks={webhooks || []}
              preferences={notificationPreferences || {
                id: 'default',
                userId: 'default',
                channels: { email: true, webhook: true, voice: true, inApp: true },
                severityThreshold: 'info',
                quietHours: { enabled: false, start: '22:00', end: '08:00' },
                grouping: { enabled: false, windowMinutes: 5 },
              }}
              onImport={handleConfigImport}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Settings</h2>
              <p className="text-muted-foreground">Configure API integrations and platform credentials</p>
            </div>
            <Settings 
              incidents={incidents || []}
              alerts={alerts || []}
              metrics={metrics || []}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default App
