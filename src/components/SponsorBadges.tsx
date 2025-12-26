import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Lightning, Waveform, Database } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function SponsorBadges() {
  const sponsors = [
    {
      name: 'Google Cloud',
      feature: 'Gemini AI Analysis',
      icon: Lightning,
      color: 'oklch(0.65 0.19 245)',
      status: 'active'
    },
    {
      name: 'Datadog',
      feature: 'Detection & Incidents',
      icon: CheckCircle,
      color: 'oklch(0.68 0.18 305)',
      status: 'active'
    },
    {
      name: 'Confluent',
      feature: 'Real-time Streaming',
      icon: Database,
      color: 'oklch(0.70 0.17 145)',
      status: 'active'
    },
    {
      name: 'ElevenLabs',
      feature: 'Voice Interface',
      icon: Waveform,
      color: 'oklch(0.75 0.15 195)',
      status: 'active'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {sponsors.map((sponsor, idx) => {
        const Icon = sponsor.icon
        return (
          <motion.div
            key={sponsor.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-4 border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: sponsor.color }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={20} weight="fill" style={{ color: sponsor.color }} />
                  <h3 className="font-semibold text-sm">{sponsor.name}</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                  <span className="w-2 h-2 rounded-full bg-success mr-1.5 inline-block" />
                  Live
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{sponsor.feature}</p>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
