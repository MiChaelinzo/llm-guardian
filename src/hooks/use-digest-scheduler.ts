import { useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import type { DigestConfig } from '@/lib/email-digest'
import type { Incident, Alert, TelemetryMetric, EmailNotificationLog } from '@/lib/types'
import { emailDigestService } from '@/lib/email-digest'
import { calculateMetrics } from '@/lib/metrics'

interface UseDigestSchedulerProps {
  incidents: Incident[]
  alerts: Alert[]
  metrics: TelemetryMetric[]
}

export function useDigestScheduler({ incidents, alerts, metrics }: UseDigestSchedulerProps) {
  const [digestConfigs] = useKV<DigestConfig[]>('email-digest-configs', [])
  const [, setDigestConfigs] = useKV<DigestConfig[]>('email-digest-configs', [])
  const [, setEmailLogs] = useKV<EmailNotificationLog[]>('email-notification-logs', [])
  const lastCheckRef = useRef<number>(0)

  useEffect(() => {
    const checkAndSendDigests = async () => {
      if (!digestConfigs || digestConfigs.length === 0) return

      const now = new Date()
      const currentMinute = now.getHours() * 60 + now.getMinutes()
      
      if (currentMinute === lastCheckRef.current) return
      lastCheckRef.current = currentMinute

      for (const config of digestConfigs) {
        if (!emailDigestService.shouldSendDigest(config, now)) continue

        try {
          const currentSummary = calculateMetrics(metrics, 24 * 60 * 60 * 1000)
          
          const previousMetrics = metrics.filter(m => {
            const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
            return m.timestamp >= twoDaysAgo && m.timestamp < oneDayAgo
          })
          const previousSummary = calculateMetrics(previousMetrics, 24 * 60 * 60 * 1000)

          const digestData = emailDigestService.prepareDigestData(
            config.frequency,
            incidents,
            alerts,
            metrics,
            previousSummary,
            currentSummary
          )

          const log = await emailDigestService.sendDigest(config, digestData)
          
          setEmailLogs((current) => [log, ...(current || [])].slice(0, 100))
          
          setDigestConfigs((current) =>
            (current || []).map(c =>
              c.id === config.id ? { ...c, lastSentAt: Date.now() } : c
            )
          )

          toast.success(`${config.frequency} digest sent to ${config.email}`)
        } catch (error) {
          console.error(`Failed to send digest to ${config.email}:`, error)
          toast.error(`Failed to send digest to ${config.email}`)
        }
      }
    }

    const interval = setInterval(checkAndSendDigests, 60000)
    
    checkAndSendDigests()

    return () => clearInterval(interval)
  }, [digestConfigs, incidents, alerts, metrics, setDigestConfigs, setEmailLogs])
}
