import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Lightning, Waveform, Database } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function SponsorBadges() {
  const sponsors = [
    {
      name: 'Google Cloud',
      feature: 'Gemini AI Analytics',
      icon: Lightning,
      color: 'oklch(0.65 0.19 245)',
      bgColor: 'oklch(0.65 0.19 245 / 0.1)',
      status: 'active',
      metric: 'AI Insights'
    },
    {
      name: 'Datadog',
      feature: 'Detection & Incidents',
      icon: CheckCircle,
      color: 'oklch(0.68 0.18 305)',
      bgColor: 'oklch(0.68 0.18 305 / 0.1)',
      status: 'active',
      metric: 'Monitoring'
    },
    {
      name: 'Confluent',
      feature: 'Real-time Streaming',
      icon: Database,
      color: 'oklch(0.70 0.17 145)',
      bgColor: 'oklch(0.70 0.17 145 / 0.1)',
      status: 'active',
      metric: 'Data Pipeline'
    },
    {
      name: 'ElevenLabs',
      feature: 'Voice Interface',
      icon: Waveform,
      color: 'oklch(0.75 0.15 195)',
      bgColor: 'oklch(0.75 0.15 195 / 0.1)',
      status: 'active',
      metric: 'Conversational'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {sponsors.map((sponsor, idx) => {
        const Icon = sponsor.icon
        return (
          <motion.div
            key={sponsor.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card 
              className="p-4 border-l-4 hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden" 
              style={{ borderLeftColor: sponsor.color }}
            >
              <div 
                className="absolute inset-0 opacity-5"
                style={{ backgroundColor: sponsor.color }}
              />
              <div className="relative">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={22} weight="fill" style={{ color: sponsor.color }} />
                    <h3 className="font-semibold text-sm">{sponsor.name}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs border-success/50 text-success">
                    <motion.span 
                      className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 inline-block"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    Live
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{sponsor.feature}</p>
                <Badge 
                  variant="secondary" 
                  className="text-xs mt-1"
                  style={{ color: sponsor.color }}
                >
                  {sponsor.metric}
                </Badge>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
