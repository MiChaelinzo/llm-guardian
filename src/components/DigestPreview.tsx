import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Eye } from '@phosphor-icons/react'
import type { DigestData } from '@/lib/email-digest'

interface DigestPreviewProps {
  data: DigestData
  frequency: 'daily' | 'weekly'
}

export function DigestPreview({ data, frequency }: DigestPreviewProps) {
  const [open, setOpen] = useState(false)
  const { period, incidents, alerts, metrics } = data

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Eye size={16} />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {frequency === 'daily' ? 'Daily' : 'Weekly'} Digest Preview
          </DialogTitle>
          <DialogDescription>
            {period.label} ({new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()})
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {incidents.total > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold border-b pb-2">📋 Incidents Summary</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{incidents.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg">
                    <div className="text-2xl font-bold text-success">{incidents.resolved}</div>
                    <div className="text-xs text-muted-foreground">Resolved</div>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <div className="text-2xl font-bold text-warning">{incidents.open}</div>
                    <div className="text-xs text-muted-foreground">Open</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">By Severity</div>
                  <div className="flex gap-2">
                    <Badge variant="destructive">Critical: {incidents.bySeverity.critical}</Badge>
                    <Badge variant="outline" className="border-warning text-warning">Warning: {incidents.bySeverity.warning}</Badge>
                    <Badge variant="secondary">Info: {incidents.bySeverity.info}</Badge>
                  </div>
                </div>

                {incidents.list.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Recent Incidents</div>
                    {incidents.list.map(incident => (
                      <div key={incident.id} className="p-3 border rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{incident.title}</span>
                          <Badge variant={incident.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {incident.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Status: {incident.status} • Created: {new Date(incident.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {alerts.total > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold border-b pb-2">🔔 Alerts Summary</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{alerts.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg">
                    <div className="text-2xl font-bold text-success">{alerts.acknowledged}</div>
                    <div className="text-xs text-muted-foreground">Acknowledged</div>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <div className="text-2xl font-bold text-destructive">{alerts.unacknowledged}</div>
                    <div className="text-xs text-muted-foreground">Unacknowledged</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">By Severity</div>
                  <div className="flex gap-2">
                    <Badge variant="destructive">Critical: {alerts.bySeverity.critical}</Badge>
                    <Badge variant="outline" className="border-warning text-warning">Warning: {alerts.bySeverity.warning}</Badge>
                    <Badge variant="secondary">Info: {alerts.bySeverity.info}</Badge>
                  </div>
                </div>

                {alerts.list.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Top Alerts</div>
                    {alerts.list.slice(0, 5).map(alert => (
                      <div key={alert.id} className="p-3 border rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{alert.ruleName}</span>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{alert.message}</div>
                        <div className="text-xs text-muted-foreground">
                          Value: {alert.value} • {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">📊 Performance Metrics</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">{metrics.summary.totalRequests.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Requests</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">{metrics.summary.errorRate.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">Error Rate</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">{metrics.summary.avgLatency.toFixed(0)}ms</div>
                  <div className="text-xs text-muted-foreground">Avg Latency</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">${metrics.summary.totalCost.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Total Cost</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">📈 Trends</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Latency</span>
                  <Badge variant={metrics.trends.latency === 'up' ? 'destructive' : metrics.trends.latency === 'down' ? 'default' : 'secondary'}>
                    {metrics.trends.latency === 'up' ? '📈 Increasing' : metrics.trends.latency === 'down' ? '📉 Decreasing' : '➡️ Stable'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Error Rate</span>
                  <Badge variant={metrics.trends.errorRate === 'up' ? 'destructive' : metrics.trends.errorRate === 'down' ? 'default' : 'secondary'}>
                    {metrics.trends.errorRate === 'up' ? '📈 Increasing' : metrics.trends.errorRate === 'down' ? '📉 Decreasing' : '➡️ Stable'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Cost</span>
                  <Badge variant={metrics.trends.cost === 'up' ? 'destructive' : metrics.trends.cost === 'down' ? 'default' : 'secondary'}>
                    {metrics.trends.cost === 'up' ? '📈 Increasing' : metrics.trends.cost === 'down' ? '📉 Decreasing' : '➡️ Stable'}
                  </Badge>
                </div>
              </div>

              {metrics.topIssues.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-destructive">⚠️ Top Issues</div>
                  <ul className="space-y-1">
                    {metrics.topIssues.map((issue, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground pl-4">• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {metrics.topIssues.length === 0 && (
                <div className="p-3 bg-success/10 rounded-lg text-success text-sm">
                  ✅ No significant issues detected
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
