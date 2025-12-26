import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Broadcast, CheckCircle, Warning } from '@phosphor-icons/react'
import type { WebhookConfig } from '@/lib/types'

export function WebhookStatus() {
  const [webhooks] = useKV<WebhookConfig[]>('webhooks', [])

  const activeWebhooks = (webhooks || []).filter(w => w.enabled)
  const slackWebhooks = activeWebhooks.filter(w => w.provider === 'slack')
  const pagerdutyWebhooks = activeWebhooks.filter(w => w.provider === 'pagerduty')

  if (!webhooks || webhooks.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Broadcast size={20} weight="bold" />
          Webhook Integrations
        </CardTitle>
        <CardDescription>Active alert destinations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeWebhooks.length === 0 ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Warning size={16} weight="bold" />
              No active webhooks configured
            </div>
          ) : (
            <div className="space-y-2">
              {slackWebhooks.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="bold" className="text-success" />
                  <span className="text-sm font-medium">Slack</span>
                  <Badge variant="secondary" className="text-xs">
                    {slackWebhooks.length} {slackWebhooks.length === 1 ? 'channel' : 'channels'}
                  </Badge>
                </div>
              )}
              {pagerdutyWebhooks.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="bold" className="text-success" />
                  <span className="text-sm font-medium">PagerDuty</span>
                  <Badge variant="secondary" className="text-xs">
                    {pagerdutyWebhooks.length} {pagerdutyWebhooks.length === 1 ? 'service' : 'services'}
                  </Badge>
                </div>
              )}
              <div className="pt-2 text-xs text-muted-foreground">
                Alerts will be sent to {activeWebhooks.length} {activeWebhooks.length === 1 ? 'destination' : 'destinations'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
