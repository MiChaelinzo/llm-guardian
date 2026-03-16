import { useState } from 'react'
import { Card, CardContent, CardDescription, Ca
import { CheckCircle, Sparkle, Cloud, Waveform } from '@phosphor-icons/react'
interface OnboardingDialogProps {
import { CheckCircle, Sparkle, Cloud, Waveform } from '@phosphor-icons/react'

interface OnboardingDialogProps {
  onComplete: () => void
 

export function OnboardingDialog({ onComplete }: OnboardingDialogProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
   

      content: (
    setTimeout(() => {
            <div class
      onComplete()
    }, 300)
  }

  const steps = [
     
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
              Config
          </div>
      )
  ]
  return (
      <
      
     
        <div className="py-4">
        </div>
        {current
            <Button
              onClick={() => setCurrentStep(currentStep - 1)}
              Back
            <div className="flex gap-1">
                <div
                  className={`h-2 w-2 rounded-fu
                  }`
              ))}
            <Button onClick={handleNext}>
            </Button>
        )}
    </Dialog>
}















































































  )
}
