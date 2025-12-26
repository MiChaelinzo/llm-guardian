import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert as AlertComponent } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Warning, CheckCircle, Info, Bell, FilePdf } from '@phosphor-icons/react'
import { formatTimestamp } from '@/lib/metrics'
import type { Alert } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { exportAlertsToPDF } from '@/lib/pdf-export'
import { toast } from 'sonner'

interface AlertsListProps {
  alerts: Alert[]
  onAcknowledge: (alertId: string) => void
  onCreateIncident: (alert: Alert) => void
}

export function AlertsList({ alerts, onAcknowledge, onCreateIncident }: AlertsListProps) {
  const activeAlerts = alerts.filter(a => !a.acknowledged).slice(-10).reverse()

  const handleExportAlerts = () => {
    if (alerts.length === 0) {
      toast.error('No alerts to export')
      return
    }
    
    try {
      exportAlertsToPDF(alerts)
      toast.success('Alerts exported to PDF')
    } catch (error) {
      toast.error('Failed to export alerts')
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Warning size={20} weight="fill" className="text-destructive" />
      case 'warning':
        return <Warning size={20} weight="fill" className="text-warning" />
      default:
        return <Info size={20} weight="fill" className="text-primary" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/10 border-destructive'
      case 'warning':
        return 'bg-warning/10 border-warning'
      default:
        return 'bg-primary/10 border-primary'
    }
  }

  if (activeAlerts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-success" weight="fill" />
        <h3 className="text-xl font-semibold mb-2">No Active Alerts</h3>
        <p className="text-muted-foreground">All detection rules are monitoring normally</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={20} weight="fill" className="text-cost" />
          <h3 className="font-semibold">Active Alerts</h3>
          <Badge variant="secondary">{activeAlerts.length}</Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cost" />
            Datadog
          </Badge>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleExportAlerts}
          disabled={alerts.length === 0}
          className="gap-2"
        >
          <FilePdf size={16} weight="fill" />
          Export PDF
        </Button>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          <AnimatePresence>
            {activeAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{alert.ruleName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCreateIncident(alert)}
                          className="text-xs h-7"
                        >
                          Create Incident
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onAcknowledge(alert.id)}
                          className="text-xs h-7"
                        >
                          Acknowledge
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  )
}
