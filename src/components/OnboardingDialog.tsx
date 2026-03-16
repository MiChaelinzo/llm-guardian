import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogOverlay,
  DialogPortal,
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
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
    setTimeout(() => {
      onComplete()
    }, 300)
  }

  const handleGoToSettings = () => {
    setIsOpen(false)
    setTimeout(() => {
      onComplete()
    }, 300)
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
              VoiceWatch AI is a generative AI application built with <strong>Amazon Nova</strong> on AWS, 
              providing intelligent, voice-driven observability for LLM applications with real-time monitoring, 
              anomaly detection, and conversational AI insights.
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <Card className="p-4 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud size={24} weight="fill" className="text-primary" />
                  <span className="font-semibold">AWS AI with Amazon Nova</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Powered by <strong>AWS Bedrock</strong> and <strong>Amazon Nova 2 Sonic</strong> for ultra-low latency speech-to-speech AI, 
                  intelligent insights, anomaly detection, and predictive forecasting.
                </p>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Get Started',
      description: 'Explore VoiceWatch AI now',
      content: (
        <div className="space-y-6">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkle size={24} weight="fill" className="text-primary" />
                <CardTitle>Demo Mode Active</CardTitle>
              </div>
              <CardDescription>
                Explore all features with simulated data immediately
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} weight="fill" className="text-success" />
                  <span><strong>Real-time Monitoring:</strong> Live telemetry data and metrics visualization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} weight="fill" className="text-success" />
                  <span><strong>AWS Nova AI:</strong> Speech-to-speech conversational AI for hands-free monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} weight="fill" className="text-success" />
                  <span><strong>Smart Alerts:</strong> Pre-configured detection rules with intelligent insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} weight="fill" className="text-success" />
                  <span><strong>AI Analytics:</strong> Anomaly detection, predictions, and optimization recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={18} weight="fill" className="text-success" />
                  <span><strong>Team Collaboration:</strong> Real-time multi-user monitoring and incident chat</span>
                </li>
              </ul>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Optional:</strong> Configure AWS Bedrock credentials in Settings to enable production Nova AI features
                </p>
                <Button onClick={handleSkipToDemo} className="w-full gap-2" size="lg">
                  <Sparkle size={18} weight="fill" />
                  Start Exploring
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground">
            You can configure AWS Nova credentials anytime in the Settings tab for production use
          </p>
        </div>
      )
    }
  ]

  return (
    <Dialog open={isOpen} modal>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-sm bg-background/80" />
        <DialogPrimitive.Content
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 max-w-2xl max-h-[90vh] overflow-y-auto"
          )}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
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
      </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
