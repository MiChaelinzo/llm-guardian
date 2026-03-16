import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Card } from '@/components/ui/card'
import { CheckCircle, Sparkle, Lightning } from '@phosphor-icons/react'

interface OnboardingDialogProps {
  onComplete: () => void
e

export function OnboardingDialog({ onComplete }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(true)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }


      title: 'Welcome to VoiceWa
    setIsOpen(false)
        <div className
      onComplete()
    }, 300)
  }

  const steps = [
     
      title: 'Welcome to VoiceWatch AI',
      description: 'AWS-Native LLM Observability Platform',
          </div>
        <div className="space-y-4">
    },
            VoiceWatch AI helps you monitor, analyze, and optimize your LLM applications with real-time insights and intelligent alerts.
      descript
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0 mt-0.5" />
            <div cl
                <div className="font-medium">Latency & Performance</div>
                <div className="text-sm text-muted-foreground">Monitor response times and throughput</div>
              </div>
                <d
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Error Detection</div>
                <div className="text-sm text-muted-foreground">Monitor failures and anomalies</div>
                <div
            </div>
              <div className="w-6 h-6 rounded-full bg-success text-success-foreground flex items
              <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Cost Analytics</div>
                <div className="text-sm text-muted-foreground">Track spending and optimize usage</div>
              </div>
      )
    <Dialog open
        <Dialo
       
      
     

          <div className="flex items-center gap-2">
              <B
                onClick={() => setC
                Back
            )}
          
            <div className="flex gap-
                <div
              <div className="flex items-center gap-2 mb-2">
                  }`}
              ))}
            
              <p className="text-sm text-muted-foreground">
          </div>
              </p>
  )









          </div>

      )

    {











              </div>







                2

              <div>



            </div>



              </div>



              </div>

          </div>

      )

  ]

  const currentStepData = steps[currentStep]

  return (



          <DialogTitle>{currentStepData.title}</DialogTitle>

        </DialogHeader>



        </div>

        <div className="flex items-center justify-between">

            {currentStep > 0 && (



              >

              </Button>

          </div>















            </Button>

        </div>

    </Dialog>
  )
}
