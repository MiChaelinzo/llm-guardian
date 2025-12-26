import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, DownloadSimple, ChartBar, Lightning, Bug } from '@phosphor-icons/react'
import { exportIncidentsReportToPDF, exportAlertsToPDF } from '@/lib/pdf-export'
import type { Incident, Alert, MetricsSummary } from '@/lib/types'
import { toast } from 'sonner'

interface ReportingDialogProps {
  incidents: Incident[]
  alerts: Alert[]
  summary: MetricsSummary
}

export function ReportingDialog({ incidents, alerts, summary }: ReportingDialogProps) {
  const [open, setOpen] = useState(false)
  const [includeMetrics, setIncludeMetrics] = useState(true)
  const [includeAlerts, setIncludeAlerts] = useState(true)
  const [includeAISuggestions, setIncludeAISuggestions] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportFullReport = async () => {
    if (incidents.length === 0) {
      toast.error('No incidents to export')
      return
    }

    setIsExporting(true)
    try {
      exportIncidentsReportToPDF(incidents, summary, {
        includeMetrics,
        includeAlerts,
        includeAISuggestions,
        dateRange: {
          start: Date.now() - 5 * 60 * 1000,
          end: Date.now()
        }
      })
      toast.success('Report exported successfully', {
        description: 'Your PDF download should start automatically'
      })
      setOpen(false)
    } catch (error) {
      toast.error('Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAlertsOnly = () => {
    if (alerts.length === 0) {
      toast.error('No alerts to export')
      return
    }

    try {
      exportAlertsToPDF(alerts)
      toast.success('Alerts exported successfully')
      setOpen(false)
    } catch (error) {
      toast.error('Failed to export alerts')
    }
  }

  const openIncidents = incidents.filter(i => i.status !== 'resolved')
  const criticalIncidents = incidents.filter(i => i.severity === 'critical')
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <FileText size={18} weight="fill" />
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={24} weight="fill" className="text-primary" />
            Export Reports & Analytics
          </DialogTitle>
          <DialogDescription>
            Generate comprehensive PDF reports with incident analysis, metrics, and AI recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Bug size={18} className="text-destructive" weight="fill" />
                <span className="text-sm font-medium">Incidents</span>
              </div>
              <div className="text-2xl font-bold">{incidents.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {openIncidents.length} open, {criticalIncidents.length} critical
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Lightning size={18} className="text-warning" weight="fill" />
                <span className="text-sm font-medium">Alerts</span>
              </div>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {unacknowledgedAlerts.length} unacknowledged
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <ChartBar size={18} className="text-success" weight="fill" />
                <span className="text-sm font-medium">Requests</span>
              </div>
              <div className="text-2xl font-bold">{summary.totalRequests}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {summary.errorRate.toFixed(1)}% error rate
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText size={16} weight="fill" />
                Full Observability Report
              </h4>
              
              <Card className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate a comprehensive report including incidents overview, system metrics, and AI-powered insights.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="include-metrics" className="cursor-pointer">
                        Include Performance Metrics
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    </div>
                    <Switch
                      id="include-metrics"
                      checked={includeMetrics}
                      onCheckedChange={setIncludeMetrics}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-alerts" className="cursor-pointer">
                      Include Alert Details
                    </Label>
                    <Switch
                      id="include-alerts"
                      checked={includeAlerts}
                      onCheckedChange={setIncludeAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="include-ai" className="cursor-pointer">
                        Include AI Recommendations
                      </Label>
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        AI-Powered
                      </Badge>
                    </div>
                    <Switch
                      id="include-ai"
                      checked={includeAISuggestions}
                      onCheckedChange={setIncludeAISuggestions}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleExportFullReport}
                  disabled={isExporting || incidents.length === 0}
                  className="w-full gap-2"
                >
                  <DownloadSimple size={18} weight="bold" />
                  {isExporting ? 'Generating...' : 'Export Full Report (PDF)'}
                </Button>
              </Card>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightning size={16} weight="fill" />
                Quick Exports
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportAlertsOnly}
                  disabled={alerts.length === 0}
                  className="gap-2"
                >
                  <Lightning size={16} weight="fill" />
                  Alerts Only
                </Button>

                <Button
                  variant="outline"
                  disabled={incidents.length === 0}
                  onClick={handleExportFullReport}
                  className="gap-2"
                >
                  <Bug size={16} weight="fill" />
                  Incidents Summary
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
            <FileText size={16} className="text-accent mt-0.5" weight="fill" />
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground">Professional Reports:</strong> All exports include timestamps, 
              severity classifications, AI insights, and sponsor branding. Perfect for incident post-mortems, 
              stakeholder updates, and compliance documentation.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
