import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Sparkle, Lightning } from '@phosphor-icons/react'

interface OnboardingDialogProps {
  onComplete: () => void
}

export function OnboardingDialog({ onComplete }: OnboardingDialogProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

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
          <p className="text-muted-foreground">
            VoiceWatch AI is a comprehensive observability platform designed specifically for monitoring and optimizing your LLM applications.
          </p>
          <div className="grid grid-cols-1 gap-3">
            <Card className="p-4 border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkle size={20} weight="fill" className="text-primary" />
                <span className="font-semibold">Voice-Driven Insights</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ask questions naturally and get instant AI-powered answers about your LLM performance metrics.
              </p>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: 'Real-Time Monitoring',
      description: 'Track performance metrics as they happen',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            VoiceWatch AI continuously monitors your LLM applications and provides real-time insights into:
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Latency & Performance</div>
                <div className="text-sm text-muted-foreground">Track average, P99, and max response times</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Error Rates</div>
                <div className="text-sm text-muted-foreground">Monitor failures and anomalies</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Cost Analysis</div>
                <div className="text-sm text-muted-foreground">Track token usage and optimize spending</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'AI-Powered Detection',
      description: 'Smart alerts and anomaly detection',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Configure detection rules to automatically identify issues and receive intelligent alerts:
          </p>
          <div className="space-y-3">
            <Card className="p-4 border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkle size={20} weight="fill" className="text-primary" />
                <span className="font-semibold">Smart Rules Engine</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Set threshold-based rules for metrics like latency, error rate, and cost
              </p>
            </Card>
            <Card className="p-4 border-accent/30">
              <div className="flex items-center gap-2 mb-2">
                <Lightning size={20} weight="fill" className="text-accent" />
                <span className="font-semibold">Instant Notifications</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified via voice alerts, webhooks, and email when issues arise
              </p>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: 'Get Started',
      description: 'Start monitoring your LLM applications',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            You're all set! Here's what to do next:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-medium">Explore the Dashboard</div>
                <div className="text-sm text-muted-foreground">View real-time metrics and charts</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-medium">Configure Detection Rules</div>
                <div className="text-sm text-muted-foreground">Set up custom alerts for your needs</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <div className="w-6 h-6 rounded-full bg-success text-success-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <div className="font-medium">Try Voice Commands</div>
                <div className="text-sm text-muted-foreground">Click the microphone to ask questions</div>
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
      <DialogContent className="max-w-2xl">
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
          
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
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
