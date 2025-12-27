import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { CheckCircle, Sparkle, Cloud, ChartBar, Database, Waveform } from '@phosphor-icons/react'
import type { APIConfig } from '@/lib/types'

interface OnboardingDialogProps {
  onComplete: () => void
}

const DEFAULT_CONFIG: APIConfig = {
  googleCloud: {
    projectId: '',
    apiKey: '',
    enabled: false
  },
  datadog: {
    apiKey: '',
    appKey: '',
    site: 'datadoghq.com',
    enabled: false
  },
  confluent: {
    apiKey: '',
    apiSecret: '',
    bootstrapServer: '',
    enabled: false
  },
  elevenLabs: {
    apiKey: '',
    agentId: '',
    enabled: false
  }
}

export function OnboardingDialog({ onComplete }: OnboardingDialogProps) {
  const [config] = useKV<APIConfig>('api-config', DEFAULT_CONFIG)
  const [step, setStep] = useState(0)
  const [isOpen, setIsOpen] = useState(true)

  const currentConfig = config || DEFAULT_CONFIG

  const handleSkipToDemo = () => {
    setIsOpen(false)
    onComplete()
  }

  const handleGoToSettings = () => {
    setIsOpen(false)
    onComplete()
  }

  const steps = [
    {
      title: 'Welcome to VoiceWatch AI',
      description: 'Your conversational LLM observability platform',
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <Waveform size={80} weight="fill" className="text-accent animate-pulse-glow" />
              <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              VoiceWatch AI combines the power of all four hackathon sponsors to create an intelligent, 
              voice-driven observability solution for LLM applications.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud size={20} weight="fill" className="text-primary" />
                  <span className="font-semibold text-sm">Google Cloud</span>
                </div>
                <p className="text-xs text-muted-foreground">Gemini AI for intelligent insights</p>
              </Card>
              
              <Card className="p-4 border-cost/30">
                <div className="flex items-center gap-2 mb-2">
                  <ChartBar size={20} weight="fill" className="text-cost" />
                  <span className="font-semibold text-sm">Datadog</span>
                </div>
                <p className="text-xs text-muted-foreground">Detection rules & incidents</p>
              </Card>
              
              <Card className="p-4 border-success/30">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={20} weight="fill" className="text-success" />
                  <span className="font-semibold text-sm">Confluent</span>
                </div>
                <p className="text-xs text-muted-foreground">Real-time data streaming</p>
              </Card>
              
              <Card className="p-4 border-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <Waveform size={20} weight="fill" className="text-accent" />
                  <span className="font-semibold text-sm">ElevenLabs</span>
                </div>
                <p className="text-xs text-muted-foreground">Voice agent interface</p>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Choose Your Experience',
      description: 'Demo mode or configure your own APIs',
      content: (
        <div className="space-y-6">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkle size={24} weight="fill" className="text-primary" />
                <CardTitle>Demo Mode</CardTitle>
              </div>
              <CardDescription>
                Perfect for exploring features with simulated data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-success" />
                  Simulated real-time telemetry data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-success" />
                  Pre-configured detection rules
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-success" />
                  AI-generated insights using built-in LLM
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-success" />
                  Voice interaction with Web Speech API
                </li>
              </ul>
              <Button onClick={handleSkipToDemo} className="w-full gap-2">
                <Sparkle size={16} weight="fill" />
                Start with Demo Mode
              </Button>
            </CardContent>
          </Card>

          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle>Production Mode</CardTitle>
              <CardDescription>
                Connect your own API credentials for real integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Cloud size={16} className="text-primary" />
                    Google Cloud
                  </span>
                  <Badge variant={currentConfig.googleCloud.enabled ? 'default' : 'outline'} className="text-xs">
                    {currentConfig.googleCloud.enabled ? 'Configured' : 'Not configured'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <ChartBar size={16} className="text-cost" />
                    Datadog
                  </span>
                  <Badge variant={currentConfig.datadog.enabled ? 'default' : 'outline'} className="text-xs">
                    {currentConfig.datadog.enabled ? 'Configured' : 'Not configured'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Database size={16} className="text-success" />
                    Confluent
                  </span>
                  <Badge variant={currentConfig.confluent.enabled ? 'default' : 'outline'} className="text-xs">
                    {currentConfig.confluent.enabled ? 'Configured' : 'Not configured'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Waveform size={16} className="text-accent" />
                    ElevenLabs
                  </span>
                  <Badge variant={currentConfig.elevenLabs.enabled ? 'default' : 'outline'} className="text-xs">
                    {currentConfig.elevenLabs.enabled ? 'Configured' : 'Not configured'}
                  </Badge>
                </div>
              </div>
              <Button onClick={handleGoToSettings} variant="outline" className="w-full">
                Configure API Credentials
              </Button>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground">
            You can always change these settings later in the Settings tab
          </p>
        </div>
      )
    }
  ]

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) onComplete()
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{steps[step].title}</DialogTitle>
          <DialogDescription>{steps[step].description}</DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {steps[step].content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-colors ${
                  idx === step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < steps.length - 1 && (
              <Button onClick={() => setStep(step + 1)}>
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
