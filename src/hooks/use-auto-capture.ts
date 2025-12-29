import { useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { captureScreenshot, createAttachmentFromScreenshot } from '@/lib/screenshot-capture'
import type { FileAttachment, Alert, Incident } from '@/lib/types'
import { toast } from 'sonner'

interface AutoCaptureSettings {
  enabled: boolean
  captureMode: 'visible' | 'full'
  captureDelay: number
  captureOnAlertCreation: boolean
  captureOnIncidentCreation: boolean
  maxCapturesPerIncident: number
}

interface UseAutoCaptureOptions {
  alerts?: Alert[]
  incidents?: Incident[]
  userId: string
  userName: string
  onCapture?: (incidentId: string, attachment: FileAttachment) => void
}

export function useAutoCapture({ alerts, incidents, userId, userName, onCapture }: UseAutoCaptureOptions) {
  const [settings] = useKV<AutoCaptureSettings>('auto-capture-settings', {
    enabled: false,
    captureMode: 'visible',
    captureDelay: 1000,
    captureOnAlertCreation: false,
    captureOnIncidentCreation: true,
    maxCapturesPerIncident: 3,
  })

  const [captureHistory] = useKV<Record<string, number>>('capture-history', {})

  const previousAlertCount = useRef<number>(0)
  const previousIncidentCount = useRef<number>(0)
  const capturingRef = useRef<boolean>(false)

  useEffect(() => {
    if (!settings?.enabled || !userId || !userName) return

    const alertCount = alerts?.length || 0
    const incidentCount = incidents?.length || 0

    const hasNewAlert = alertCount > previousAlertCount.current && settings.captureOnAlertCreation
    const hasNewIncident = incidentCount > previousIncidentCount.current && settings.captureOnIncidentCreation

    if ((hasNewAlert || hasNewIncident) && !capturingRef.current) {
      const latestIncident = incidents?.[incidents.length - 1]
      
      if (latestIncident && hasNewIncident) {
        const incidentCaptureCount = (captureHistory || {})[latestIncident.id] || 0
        
        if (incidentCaptureCount < settings.maxCapturesPerIncident) {
          capturingRef.current = true
          
          setTimeout(async () => {
            try {
              const screenshot = await captureScreenshot({
                fullPage: settings.captureMode === 'full',
              })

              const attachment = createAttachmentFromScreenshot(
                screenshot,
                userId,
                userName,
                `auto-capture-${latestIncident.id}-${Date.now()}.png`
              )

              if (onCapture) {
                onCapture(latestIncident.id, attachment)
              }

              toast.success('Screenshot automatically captured for incident', {
                description: `Captured ${settings.captureMode === 'full' ? 'full page' : 'visible area'}`,
              })
            } catch (error) {
              console.error('Auto-capture failed:', error)
            } finally {
              capturingRef.current = false
            }
          }, settings.captureDelay)
        }
      }
    }

    previousAlertCount.current = alertCount
    previousIncidentCount.current = incidentCount
  }, [alerts?.length, incidents?.length, settings, userId, userName, onCapture, captureHistory])

  return {
    isEnabled: settings?.enabled || false,
    settings,
  }
}
