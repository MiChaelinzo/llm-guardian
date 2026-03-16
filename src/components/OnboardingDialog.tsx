import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, Sparkle, Cloud, Waveform } from '@phosphor-icons/react'

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
    setTimeout(() => {
      setIsOpen(false)
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
                  AI-powered insights and analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-success" />
                  Voice commands and speech synthesis
                </li>
              </ul>
              <Button 
                onClick={handleComplete} 
                className="w-full mt-4"
              >
                Continue with Demo Mode
              </Button>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Want to use your own AWS credentials?
            </p>
            <Button 
              variant="outline" 
              onClick={handleComplete}
            >
              Configure in Settings Later
            </Button>
          </div>
        </div>
      )
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{steps[currentStep].title}</DialogTitle>
          <DialogDescription>{steps[currentStep].description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {steps[currentStep].content}
        </div>

        {currentStep > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </Button>
            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    idx === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
