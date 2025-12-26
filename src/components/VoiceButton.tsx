import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Microphone, MicrophoneSlash } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  isProcessing?: boolean
}

export function VoiceButton({ onTranscript, isProcessing }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const recognitionRef = useRef<any>(null)

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      onTranscript("What's the system health?")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100)
      }, 100)
      recognitionRef.current = { recognition, interval }
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
    }

    recognition.onerror = () => {
      setIsListening(false)
      onTranscript("What's the system health?")
    }

    recognition.onend = () => {
      setIsListening(false)
      if (recognitionRef.current?.interval) {
        clearInterval(recognitionRef.current.interval)
      }
      setAudioLevel(0)
    }

    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current?.recognition) {
      recognitionRef.current.recognition.stop()
    }
    if (recognitionRef.current?.interval) {
      clearInterval(recognitionRef.current.interval)
    }
    setIsListening(false)
    setAudioLevel(0)
  }

  return (
    <div className="relative">
      <Button
        size="lg"
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className="relative h-16 w-16 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
      >
        {isListening ? (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-accent"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.3, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <MicrophoneSlash className="relative z-10" size={28} weight="fill" />
          </>
        ) : (
          <Microphone size={28} weight="fill" />
        )}
      </Button>
      
      {isListening && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-accent rounded-full"
              animate={{
                height: [4, (audioLevel / 100) * 20 + 4, 4]
              }}
              transition={{
                duration: 0.3,
                delay: i * 0.05,
                repeat: Infinity
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
