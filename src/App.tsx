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
import { VoiceButton } from '@/components/VoiceButton'
import { TrendVisualization } from '@/components/Trend
import { TelemetrySimulator } from '@/lib/simulator'
import { processVoiceQuery } from '@/lib/voice'
import type { TelemetryMetric, DetectionRule, Alert, Incid
function App() {
  const [rules, setRules] = useKV<DetectionRule[
  const [incidents, setIncidents] = useKV<Incid
  const [aiInsights, setAiInsights] = useKV<
  ])

  const [timeRan
  const [lastVoiceResponse, setLastVoiceResponse] = useState<string>('')

    const checkOnboarding = async () => {
      if (!hasSeenOnboarding) {
      }
    checkOnboarding()

    

  useEffect(() => {
      const hasStorage = await window.spark.kv.get('encrypted
    }
    const interval = setInterval(checkEncryptedStorage, 2000)
  }, [])
  useEffect(() => {

          id: 'rule
          description: 'Triggers when ave
          condition: 'gt',
          severity: 'warning',
          actions: ['alert', 'n
       
     
          metric: 'p9
        

        },
          id: 'rule_3',
          description: 'Trig
   

          actions: 
      ]
    }

    c
      setMetrics((current) 
        const cutoff = Date.now() - 5 * 60 * 1000
      })


  }, [setMetrics])
  useEffect(() => {
      if (!metrics || !rules || !alerts) retu
      con
      const newAlerts: 
      enabledRules.forEach((rule) => 
        let shouldAlert = false
        switch (rule.condition)
            shouldAlert = 
          case 'lt':
            break
            shouldAlert 
          case 'gte':
          
         
        }
        if (shouldAlert) {
            a => a.ruleId === rule.id && !a.acknowledged && Date.now()

            const alert: A
              ruleId: rule
              message: `${rule.
              timestamp:
              metadata: {
          
         
            }
          }
      })
      if (newAlerts.length > 0
        
          toast.error(ale
            duration: 5000

            const utterance = new SpeechSynthesisU
         
       
          }
     
            for (const 

                  c
                  console.warn(`Webhook filter
              } catch (error) {
              }
          }
      }

  }, [me
  cons

    toast.success(

    c
      id: `rule_${

  }, [setRules])
  const handleEditRule = useCallback((ru
      (current || []).map(r => r.id === ruleId 
    to

    setRules((current) =>
    )

  const handleAcknowledgeAlert = useCa
      (current || []).map(a => a.id === alertId 
    toast.success('Alert acknow

    const incident: Incident = {
      title: alert.r
      severity: alert.severity,
      createdAt: 
    }
    setIncidents((current) => [...(current || []), inc
    toast.success

    setIncidents((current) =>
        i.id === 
          : i
    )
  }, [setIncident
  const handleVoiceTr
    try {
        transcrip
        a

      if ('speechSynthesis
        window.speechSynthesis.speak(utteran
    } catch (error) {
      toast

  }, [metrics, alerts, timeRang
  const summary = calculateMetrics
  return (
      <OnboardingDialog 
      />
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          <header className="flex flex
              <div className="w-10 h
              </div>
                <h1 class
              </div>

              <EncryptionStatus hasEncryp
                
              />
          </h
          <SponsorBadges />
          {
         
        

              <TabsTrigger value=
                Dashboard
        
                Alerts
              <TabsTrigger value="rule
                Rules
              <TabsTrigger
            

                Settings
            </TabsList>
            <TabsContent value="dashboard" classN
             
              </div>
              <MetricCards summ
              <WebhookStatus />
           

                  metrics={metrics || []}
                  title="Latency Trend with Forecast"
                  timeRange={timeRange}

                  metrics={metrics || []}
                  title="Error
                  timeRange={timeRange}

                  <MetricChart
                 
                    color="oklc
                  />
               
             
           
          
       
            

              <div>
                <p className="text-muted-foreground">Real-time

                alerts={alerts || []}
                onCreateI
            </TabsContent>
     
                <h2 className="te
              </

                onToggleRule={handleToggleRule}
                onEditRule={handleEd
              

     
                <p className="text-muted-foreground">Tra

                


              <Settings /
          </Tabs>
     
  )





































































































































































































































