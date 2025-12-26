import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { MetricCards } from '@/components/MetricCards'
import { MetricChart } from '@/components/MetricChart'
import { AIInsights } from '@/components/AIInsights'
import { DetectionRules } from '@/components/Detecti
import { EncryptionStatus } from '@/components/Encry
import { Settings } from '@/components/Settings'
import { DetectionRules } from '@/components/DetectionRules'
import { IncidentsList } from '@/components/IncidentsList'
import { EncryptionStatus } from '@/components/EncryptionStatus'
import { OnboardingDialog } from '@/components/OnboardingDialog'
import { SponsorBadges } from '@/components/SponsorBadges'
import { ConfluentStream } from '@/components/ConfluentStream'
import { TelemetrySimulator } from '@/lib/simulator'
import type { TelemetryMetric, DetectionRule, Alert, Incident, MetricsSummary } from '@/lib/typ
function App() {
  const [rules, setRules] = useKV<DetectionRule[]>('detection-rules', [])
  const [incidents, setIncidents] = useKV<Incident[]>('incidents', [])
    'System performance is stable with normal l
  ])

  const [timeRan
  const [hasEncryptedCreds, setHasEncryptedCreds] = useState(false)
  useEffect(() => {
      const hasStorage = await window.spark.kv.get('encrypted_cre
    }
    const interval = setInterval(checkEncryptedStorage, 20
  }, [])
  useEffect(() => {
    
          id: 'rule_1',
          description: 'Triggers when average latency exceeds thres
          condition: 'gt',
          severity: 'warning',
          actions: ['alert', 'notify']
        {

          metric: '
          threshold: 2000,
          enabled: true,
        },
     
          description: 'Tri
          condition: 'gt',
          severity: 'critical',
        

          name: 'Bu
          metric: 'totalCost',
          threshold: 100,
         
        }
      setRules(defaultRules)
  }, [rules, setRules])
  useEffect(() => {
      setMetrics((current)
        const cutoff = Da
      })

    simulator.start()
    return
    }

    const interval = setInterval(() => 
      
      const enabledRules = rule

        const metricValue 

          case 'gt':
            break
          
         
            break
            shouldAlert = metricVal
          case 'lte':
            break

          const existin
          )
          if (!existingA
              id: `alert_${D
          
         
              value: me
                metric: rule.me
                condition: rule.condition
              acknowledged: fa
            newAlerts.push
        }

        setAlerts((curre
        newAlerts.forEach((alert) => {
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

      (current || []).filter(r => r.id !
  }, [metrics, rules, alerts, setAlerts, timeRange])

      (current || [
    toast.success('Alert acknowledged')

    co
    const incident: Incident = {
      title: alert.ruleName,
      severity: alert.severit
      created


    handleAcknowledgeAlert(ale
  }, [setIncidents, handleAcknowledgeAlert])
  const handleResolveIncident = useCallback((incidentId: string) =
      (current || []).map(i => 
       
     



    <div className="min-h-screen bg-back
        onComplete={() 

        <div className="flex flex-col gap-6">
            <div className="fl
                <Waveform className="text-primar

         
            </div>
            <div className="flex items-center gap-3">

                isProcessing={isProcessin



            <div className="p-4 bg-accent/20 rounded-lg border border
            </div>

            <TabsList className="grid w-full gr
       

                <Bell size={16} weight="bold" 
              </TabsTrigger>
                <Lightning size={16} weight="bold" />
              </TabsTrigger>
       

                <Waveform size={16} weight="bold
              </TabsTrigger>

              <div cl
                <ConfluentStream metricsCount={(metr


     
                  type=

                />
                <MetricCh
                  type="error"
     
                

                  type="cost"
                  color="oklch(0.68 
              
                <MetricChart
     
                  color="oklch(0.70 0.17 145)"
                />

  
            <TabsContent value="alerts" className="space-y-6 mt-6">
                <h2 class
              </div>
     
                
  

              <div>
                <p className="text-muted-foregroun

                

                onDeleteRule={handleDeleteRule}
            </TabsContent>
            <TabsContent value="incidents" className="space-y-6 mt-6">
     
              </div>
              <In

            </TabsContent>
            <TabsContent value="settings" className="space-y-6 m

        </div>
    </div>
}
export default App










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
        open={showOnboarding} 
        onOpenChange={setShowOnboarding}
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
              <EncryptionStatus hasEncrypted={hasEncryptedCreds} />
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
                <ConfluentStream />
              </div>

              <MetricCards summary={summary} />

              <div className="grid gap-6">
                <MetricChart
                  metrics={metrics || []}
                  type="latency"
                  title="Average Latency"
                  color="oklch(0.65 0.19 245)"
                  timeRange={timeRange}


                <MetricChart
                  metrics={metrics || []}
                  type="error"
                  title="Error Count"
                  color="oklch(0.65 0.22 25)"
                  timeRange={timeRange}


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

              <AIInsights insights={aiInsights} />
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
                summary={summary}
                onToggle={handleToggleRule}
                onAdd={handleAddRule}
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

  )



