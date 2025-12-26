import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { MetricCards } from '@
import { VoiceButton } from '@/components/VoiceButton'
import { MetricCards } from '@/components/MetricCards'
import { MetricChart } from '@/components/MetricChart'
import { AlertsList } from '@/components/AlertsList'
import { AIInsights } from '@/components/AIInsights'
import { Settings } from '@/components/Settings'
import { EncryptionStatus } from '@/components/EncryptionS
import { TelemetrySimulator } from '@/lib/simulator'
import { processVoiceQuery, generateIncidentSuggestion, genera
import { ChartLine, Bell, Lightning, Bug, Wavefo
function App() {
  const [rules, setRules] = useKV<DetectionRule[]>('detection-ru
  const [incidents, setIncidents] = useKV<Incident[]>('inciden
  const [isProcessingVoice, setIsProcessingVoice] = 
  const [showOnboarding, setShowOnboarding] = useState(true)
    'System performance is stable with normal latency patterns.',
    'All integrations operational and streaming data.'
  const [hasEncryptedCreds, setHasEncryptedCreds] = useState(false)

      const hasS
    }
    checkEncryptedStorage()
    const interval = setInterval(checkEncryptedStorage, 20
  }, [])
  useEffect(() => {
      const defaultRules: DetectionRule[] = [
          id: 'rule_1',
          description: 'Triggers when average latency exceed
          condition: 'gt',
          severity: 'warning',
          actions: ['alert', 'notify']
        {
    
          metric: 'p99Latency',

          enabled: 
        },
          id: 'rule_3',
          description: 'Triggers when
     
    
          actions: ['alert'
    
          name: 'Budget Alert',
          metric: 'totalCost',
        

        }
      setRules(defaultRules)
  }, [rules, setRules])
  useEffe
      setMetrics((curre
        const cutoff = Date.now() - 5 *
      })


      simulator.stop()
  }, [setMetrics])
  useEffect(() => {
      if (!metrics || !rules || !alert
      cons

        setAlerts((curr
          toast.error(alert.message, {
            duration: 5000

            const utteranc
            )
            utterance.pitch = 1
          }
      }

  }, [met
  useEffect(() => {
      if (!metrics || !alerts) ret
      const summary = calculateMetrics(metrics, 5 * 60 * 1000
      setAiInsights(insights)

      if (metrics && al
        const insights = await 
      }


  }, [met
  const handleVoiceTran
    setLastVoiceResponse(`You: 
    try {
      const response = await p
      setLastVoiceResponse
      if ('speechSynthe
        const utterance = new 
        utterance.pitch 
      }
      if 
      }
      }
     
      })

      setIsProcessi
  }, [metrics, alerts])
  const handleToggleRule = useC
      (current || []).map(r => r.id === ruleId ? { .
  }, [setRules])
  const handleAddRule = useCallback((rule: Omit<Detection
      ..
    }

  

    )
  
    s
    )

    setAlerts((curr
    )
  }, [setAlerts])
  cons

      id: `incident_${Date.now()}`,

      status: 'open',
      alerts: [alert],
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
                    timeRange
                  />

                    title="Error Count"
                    color="ok
                  <MetricChart
                    type="cost"
                    timeRange={timeR
                  />
                    metrics={metrics || []}
                    title="Request Rate"
                    color="oklch(0.70 0.17 145
                </div>

         
                
        

                <Det

                  onEditRule={handleEditRule}
                />

          
                    <h2 className="text-2xl font
                      Track, investigate, and resolve critical inciden
      
                    incidents={i
                    summary={summary}
                </div>
        
                />

                <Settings />
            </Tabs>
        </div>
    </div>
}
export default App




























































































































                  onEditRule={handleEditRule}
                  onDeleteRule={handleDeleteRule}


































