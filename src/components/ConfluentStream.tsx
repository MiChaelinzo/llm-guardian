import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, ArrowsClockwise, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface DataStreamProps {
  metricsCount: number
}

export function ConfluentStream({ metricsCount }: DataStreamProps) {
  const eventsPerSecond = Math.floor(metricsCount / 60)

  return (
    <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={24} weight="fill" className="text-success" />
            <CardTitle>Data Stream</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <CheckCircle size={12} weight="fill" className="text-success" />
            Confluent
          </Badge>
        </div>
        <CardDescription>Real-time telemetry processing pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <ArrowsClockwise size={20} weight="bold" className="text-success" />
              </motion.div>
              <span className="text-sm font-medium">Events/sec</span>
            </div>
            <span className="text-2xl font-bold font-mono">{eventsPerSecond}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-card border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">Total Events</div>
              <div className="font-mono font-semibold">{metricsCount.toLocaleString()}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-card border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">Lag</div>
              <div className="font-mono font-semibold text-success">~0ms</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-card border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">Partitions</div>
              <div className="font-mono font-semibold">3</div>
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <Badge variant="secondary" className="gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Producer Active
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Consumer Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
