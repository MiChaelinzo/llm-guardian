import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Sparkle, Lightning, Waveform } from '@phosphor-icons/react'

interface OnboardingDialogProps {
  onComplete: () => void
}

export function OnboardingDialog({ onComplete }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(true)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsOpen(false)
    setTimeout(() => {
      onComplete()
    }, 300)
  }

  const steps = [
    {
      title: 'Welcome to VoiceWatch AI',
      description: 'AWS-Native LLM Observability Platform',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            VoiceWatch AI helps you monitor, analyze, and optimize your LLM applications with real-time insights and intelligent alerts.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Latency & Performance</div>
                <div className="text-sm text-muted-foreground">Monitor response times and throughput</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Error Detection</div>
                <div className="text-sm text-muted-foreground">Track failures and anomalies</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Cost Analytics</div>
                <div className="text-sm text-muted-foreground">Track spending and optimize usage</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Voice-Driven Intelligence',
      description: 'Ask questions naturally with AI-powered voice commands',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Waveform size={24} weight="fill" className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-1">Natural Language Queries</div>
              <div className="text-sm text-muted-foreground">
                "What's my average latency?" or "Show critical alerts"
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Click the microphone button in the top right corner to start interacting with your monitoring data using voice commands.
          </p>
        </div>
      )
    },
    {
      title: 'AWS Nova 2 Sonic Integration',
      description: 'Real-time conversational AI for observability',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Lightning size={24} weight="fill" className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-1">Speech-to-Speech AI</div>
              <div className="text-sm text-muted-foreground">
                Have natural conversations about your system health
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure your AWS credentials in Settings to enable Nova 2 Sonic for advanced conversational monitoring.
          </p>
        </div>
      )
    },
    {
      title: 'Smart Detection & Alerts',
      description: 'AI-powered anomaly detection and intelligent notifications',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set up custom detection rules to monitor your LLM metrics and receive real-time alerts when thresholds are exceeded.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <Sparkle size={20} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Automated Detection</div>
                <div className="text-sm text-muted-foreground">AI identifies patterns and anomalies</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <Sparkle size={20} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Multi-Channel Notifications</div>
                <div className="text-sm text-muted-foreground">Email, webhooks, and voice alerts</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{currentStepData.title}</DialogTitle>
          <DialogDescription>{currentStepData.description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStepData.content}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-primary'
                      : index < currentStep
                      ? 'w-6 bg-primary/60'
                      : 'w-4 bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
