import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { CheckCircle, Sparkle, Lightning } from '@phosphor-icons/react'
interface OnboardingDialogProps {
}

  const [currentStep, setCurrentS
  const handleNext = () 
 

  }
  const handleComplete = () => {
    setTimeout(() => {


    {
      description: 'AWS-Native LLM Ob
        <div
            VoiceWatch
     
   

              <p className="text
              </p>
          </div>
      )
    {
   

            Voice
     
              <CheckCircle size={20} wei
                <div className="font-medium">Latency & Perf
              </
            <div className="flex it
              <div>
                <div className="text-sm text-muted-foreground">Monitor failures and anomalies</div>
            </
              <CheckCircle size={20} weight="fill"
                <div className="font-medium">Cost An
              </div>
          </div>
      )
              </div>
      description: 'Smart alerts and anomaly detection',
        <div className="space-y-4">
            Config
          <div clas
              <d
              
       
      
     
                <Lightning size={20}
              </div>
                
            </Card>
        </div>
    },
      title: '
      content: (
          <p className="text-muted-foreground">
          </p>
            <div cl
                1
              <div>
                <div
            </div>
              <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-c
              </div>
                <di
              </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                3
              <div
                <div className="text-sm text-muted-foreground">Click the microphone to ask quest
            </div>
        </div>
    }


    <Dialog open={
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
                  }`}
                <Sparkle size={20} weight="fill" className="text-primary" />
                <span className="font-semibold">Smart Rules Engine</span>
              </div>
          </div>
                Set threshold-based rules for metrics like latency, error rate, and cost
  )
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

    },

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

              <div>
                <div className="font-medium">Explore the Dashboard</div>
                <div className="text-sm text-muted-foreground">View real-time metrics and charts</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">

              </div>

                <div className="font-medium">Configure Detection Rules</div>
                <div className="text-sm text-muted-foreground">Set up custom alerts for your needs</div>
              </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <div className="w-6 h-6 rounded-full bg-success text-success-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                3

              <div>
                <div className="font-medium">Try Voice Commands</div>
                <div className="text-sm text-muted-foreground">Click the microphone to ask questions</div>

            </div>

        </div>

    }





    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>

          <DialogDescription>{currentStepData.description}</DialogDescription>

        
        <div className="py-4">
          {currentStepData.content}



          <div className="flex items-center gap-2">

              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}

                Back

            )}

          
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

          </div>

      </DialogContent>



