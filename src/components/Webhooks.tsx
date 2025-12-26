import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, Broadcast, CheckCircle, Warning } from '@phosphor-icons/react'
import { testWebhook } from '@/lib/webhooks'
import type { WebhookConfig, RuleSeverity } from '@/lib/types'

interface WebhooksProps {
  onWebhookAdded?: () => void
}

export function Webhooks({ onWebhookAdded }: WebhooksProps) {
  const [webhooks, setWebhooks] = useKV<WebhookConfig[]>('webhooks', [])
  const [showDialog, setShowDialog] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    provider: 'slack' as 'slack' | 'pagerduty' | 'teams',
    url: '',
    enabled: true,
    severityFilter: ['critical', 'warning', 'info'] as RuleSeverity[]
  })

  const handleAddWebhook = () => {
    const newWebhook: WebhookConfig = {
      id: `webhook_${Date.now()}`,
      name: formData.name,
      provider: formData.provider,
      url: formData.url,
      enabled: formData.enabled,
      severityFilter: formData.severityFilter,
      createdAt: Date.now()
    }

    setWebhooks((current) => [...(current || []), newWebhook])
    setShowDialog(false)
    setFormData({
      name: '',
      provider: 'slack',
      url: '',
      enabled: true,
      severityFilter: ['critical', 'warning', 'info']
    })

    toast.success('Webhook added successfully')
    onWebhookAdded?.()
  }

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks((current) => (current || []).filter(w => w.id !== webhookId))
    toast.success('Webhook deleted')
  }

  const handleToggleWebhook = (webhookId: string) => {
    setWebhooks((current) =>
      (current || []).map(w =>
        w.id === webhookId ? { ...w, enabled: !w.enabled } : w
      )
    )
  }

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    setTesting(webhook.id)
    const success = await testWebhook(webhook)
    
    if (success) {
      toast.success('Webhook test successful')
    } else {
      toast.error('Webhook test failed')
    }
    setTesting(null)
  }

  const toggleSeverityFilter = (severity: RuleSeverity) => {
    setFormData(prev => ({
      ...prev,
      severityFilter: prev.severityFilter.includes(severity)
        ? prev.severityFilter.filter(s => s !== severity)
        : [...prev.severityFilter, severity]
    }))
  }

  const getProviderPlaceholder = () => {
    switch (formData.provider) {
      case 'slack':
        return 'https://hooks.slack.com/services/...'
      case 'pagerduty':
        return 'https://events.pagerduty.com/v2/enqueue'
      case 'teams':
        return 'https://outlook.office.com/webhook/...'
      default:
        return ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Broadcast size={24} weight="bold" />
              Webhook Integrations
            </CardTitle>
            <CardDescription>
              Send alerts to Slack, PagerDuty, or Microsoft Teams
            </CardDescription>
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={18} weight="bold" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Webhook Integration</DialogTitle>
                <DialogDescription>
                  Configure a webhook to receive real-time alerts
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Name</Label>
                  <Input
                    id="webhook-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Production Alerts"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-provider">Provider</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value: 'slack' | 'pagerduty' | 'teams') =>
                      setFormData({ ...formData, provider: value })
                    }
                  >
                    <SelectTrigger id="webhook-provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="pagerduty">PagerDuty</SelectItem>
                      <SelectItem value="teams">Microsoft Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder={getProviderPlaceholder()}
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                  {formData.provider === 'slack' && (
                    <p className="text-xs text-muted-foreground">
                      Get your Slack webhook URL from: Slack → Workspace → Add apps → Incoming Webhooks
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Severity Filter</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={formData.severityFilter.includes('critical') ? 'default' : 'outline'}
                      onClick={() => toggleSeverityFilter('critical')}
                    >
                      Critical
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={formData.severityFilter.includes('warning') ? 'default' : 'outline'}
                      onClick={() => toggleSeverityFilter('warning')}
                    >
                      Warning
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={formData.severityFilter.includes('info') ? 'default' : 'outline'}
                      onClick={() => toggleSeverityFilter('info')}
                    >
                      Info
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="webhook-enabled">Enable immediately</Label>
                  <Switch
                    id="webhook-enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddWebhook}
                  disabled={!formData.name || !formData.url || formData.severityFilter.length === 0}
                >
                  Add Webhook
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {!webhooks || webhooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Broadcast size={48} className="mx-auto mb-3 opacity-50" />
            <p>No webhooks configured</p>
            <p className="text-sm">Add a webhook to start sending alerts to your team</p>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {webhook.name}
                      {webhook.enabled ? (
                        <Badge variant="outline" className="text-success">
                          <CheckCircle size={14} weight="fill" className="mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Warning size={14} weight="fill" className="mr-1" />
                          Disabled
                        </Badge>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      {webhook.provider}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono break-all mt-1">
                      {webhook.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">Severity filter:</span>
                  {webhook.severityFilter.map((severity) => (
                    <Badge
                      key={severity}
                      variant="outline"
                      className="text-xs"
                    >
                      {severity}
                    </Badge>
                  ))}
                </div>

                <Separator className="my-3" />

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestWebhook(webhook)}
                    disabled={testing === webhook.id || !webhook.enabled}
                  >
                    {testing === webhook.id ? 'Testing...' : 'Test'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleWebhook(webhook.id)}
                  >
                    {webhook.enabled ? 'Disable' : 'Enable'}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="ml-auto"
                  >
                    <Trash size={16} weight="bold" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
