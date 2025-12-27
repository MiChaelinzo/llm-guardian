import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Lightning, CheckCircle, ArrowsClockwise } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { TelemetryMetric } from '@/lib/types'

interface Props {
  metrics: TelemetryMetric[]
}

interface StreamEvent {
  id: string
  timestamp: number
  type: 'request' | 'latency' | 'error' | 'success'
  message: string
  partition: number
}

export function RealtimeStreamVisualizer({ metrics }: Props) {
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [throughput, setThroughput] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (metrics.length === 0) return

    const latestMetric = metrics[metrics.length - 1]
    const newEvent: StreamEvent = {
      id: latestMetric.id,
      timestamp: latestMetric.timestamp,
      type: latestMetric.type === 'error' ? 'error' : 
            latestMetric.value < 1000 ? 'success' : 'latency',
      message: formatEventMessage(latestMetric),
      partition: Math.floor(Math.random() * 3)
    }

    setEvents(prev => [...prev.slice(-19), newEvent])
    
    const recentMetrics = metrics.filter(m => 
      Date.now() - m.timestamp < 10000
    )
    setThroughput(recentMetrics.length / 10)

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [metrics])

  const formatEventMessage = (metric: TelemetryMetric): string => {
    switch (metric.type) {
      case 'request':
        return `${metric.metadata.model} → ${metric.metadata.endpoint}`
      case 'latency':
        return `Response ${metric.value.toFixed(0)}ms`
      case 'error':
        return `Error ${metric.metadata.statusCode}: ${metric.metadata.errorType || 'Unknown'}`
      case 'tokens':
        return `${metric.value} tokens processed`
      case 'cost':
        return `$${metric.value.toFixed(4)} cost`
      default:
        return 'Event processed'
    }
  }

  const eventColors = {
    request: 'text-primary',
    latency: 'text-warning',
    error: 'text-destructive',
    success: 'text-success'
  }

  const partitions = [0, 1, 2]

  return (
    <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={24} weight="fill" className="text-success" />
            <div>
              <CardTitle>Real-Time Data Stream</CardTitle>
              <CardDescription>Confluent Kafka event processing pipeline</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <CheckCircle size={12} weight="fill" className="text-success" />
              Connected
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <Card className="border-border/50 bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <ArrowsClockwise size={16} weight="bold" className="text-success" />
                  </motion.div>
                  <span className="text-xs text-muted-foreground">Throughput</span>
                </div>
                <span className="text-lg font-bold font-mono">{throughput.toFixed(1)}<span className="text-xs text-muted-foreground">/s</span></span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Events</span>
                <span className="text-lg font-bold font-mono">{metrics.length.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Lag</span>
                <span className="text-lg font-bold font-mono text-success">~0ms</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Partitions</span>
                <span className="text-lg font-bold font-mono">3</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {partitions.map(partition => {
            const partitionEvents = events.filter(e => e.partition === partition)
            const lastEvent = partitionEvents[partitionEvents.length - 1]
            
            return (
              <Card key={partition} className="border-border/50 bg-card/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium">Partition {partition}</div>
                    {lastEvent && (
                      <motion.div
                        key={lastEvent.id}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-2 h-2 rounded-full bg-success"
                      />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {partitionEvents.length} events
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30">
              <div className="text-xs font-semibold text-muted-foreground">Event Stream</div>
              <Badge variant="secondary" className="gap-1 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Live
              </Badge>
            </div>
            
            <div 
              ref={scrollRef}
              className="h-64 overflow-y-auto p-3 space-y-1.5 font-mono text-xs"
            >
              {events.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Waiting for events...
                </div>
              ) : (
                events.map((event, idx) => (
                  <motion.div
                    key={event.id + idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 py-1"
                  >
                    <span className="text-muted-foreground shrink-0">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <Badge 
                      variant="outline" 
                      className="shrink-0 h-5 text-xs"
                    >
                      P{event.partition}
                    </Badge>
                    <span className={`${eventColors[event.type]} truncate`}>
                      {event.message}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 flex-wrap text-xs">
          <Badge variant="secondary" className="gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Producer Active
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Consumer Active
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Lightning size={12} weight="fill" />
            Schema Registry
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <CheckCircle size={12} weight="fill" />
            Replication 3x
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
