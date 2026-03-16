import { useState } from 'react'
import { Button } from '@/components/ui/but
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  Dialog, 
import { 
  DialogDe
  DialogOverlay,
} from '@/compo
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
 

const DEFAULT_CONFIG: APIConfig = {
  googleCloud: {
    apiSecret: '',
    apiKey: '',
  const currentCon
  co
    setTimeo
    }, 300)

    setIsOpen(false)
      onComplete()
  }
  const steps 
      title: 'W
      content: (
          <div className
              <Wav
    
          
            <p 
              pr
            </p>
   
 

                <p className="text-sm text-muted-foreground">
                  intelligent insights, anomaly detection, and pr
              </Card>
          </div>

    {

        <div className="space-y-6"
            <CardHea
                <Spark
              </di
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
































































































































  )
}
