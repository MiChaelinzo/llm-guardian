import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Package } from '@phosphor-icons/react'

interface WebhookDelivery {
  webhookId: string
  webhookName: string
  alertId: string
  alertMessage: string
  severity: 'info' | 'warning' | 'critical'
  timestamp: number
  success: boolean
  statusCode?: number
  error?: string
}

export function WebhookStatus() {
  const [webhookDeliveries] = useKV<WebhookDelivery[]>('webhook-deliveries', [])

  const recentDeliveries = (webhookDeliveries || [])
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)

  const stats = {
    total: webhookDeliveries?.length || 0,
    successful: webhookDeliveries?.filter(d => d.success).length || 0,
    failed: webhookDeliveries?.filter(d => !d.success).length || 0
  }

  const successRate = stats.total > 0 ? (stats.successful / stats.total) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package size={24} weight="bold" />
          Webhook Delivery Status
        </CardTitle>
        <CardDescription>
          Real-time webhook delivery monitoring and status
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Sent</div>
          </div>
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <div className="text-2xl font-bold text-success">{stats.successful}</div>
            <div className="text-xs text-muted-foreground">Successful</div>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">{successRate.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Clock size={16} weight="bold" />
            Recent Deliveries
          </h4>

          {!recentDeliveries || recentDeliveries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package size={48} className="mx-auto mb-3 opacity-50" />
              <p>No webhook deliveries yet</p>
              <p className="text-sm">Webhook notifications will appear here when alerts are triggered</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDeliveries.map((delivery, index) => (
                <div
                  key={`${delivery.timestamp}-${index}`}
                  className={`flex items-start justify-between p-3 rounded-lg border ${
                    delivery.success
                      ? 'bg-success/5 border-success/20'
                      : 'bg-destructive/5 border-destructive/20'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {delivery.success ? (
                      <CheckCircle size={20} weight="fill" className="text-success mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle size={20} weight="fill" className="text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{delivery.webhookName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {delivery.severity}
                        </Badge>
                        {delivery.statusCode && (
                          <Badge variant="outline" className="text-xs">
                            {delivery.statusCode}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate">
                        {delivery.alertMessage}
                      </p>
                      
                      {delivery.error && (
                        <p className="text-xs text-destructive mt-1 truncate">
                          {delivery.error}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(delivery.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
