import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Plus, Trash, Broadcast, CheckCircle, Warning } from '@phosphor-icons/react'
import type { WebhookConfig, RuleSeverity } from '@/lib/types'
import { testWebhook } from '@/lib/webhooks'

interface WebhooksProps {
  onWebhookAdded?: () => void
}

export function Webhooks({ onWebhookAdded }: WebhooksProps) {
  const [webhooks, setWebhooks] = useKV<WebhookConfig[]>('webhooks', [])
  const [showDialog, setShowDialog] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    provider: 'slack' as 'slack' | 'pagerduty',
    url: '',
    enabled: true,
    severityFilter: ['critical', 'warning', 'info'] as RuleSeverity[]
  })

  const handleAddWebhook = () => {
    if (!formData.name || !formData.url) {
      toast.error('Please fill in all required fields')
      return
    }

    const newWebhook: WebhookConfig = {
      id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      provider: formData.provider,
      url: formData.url,
      enabled: formData.enabled,
      severityFilter: formData.severityFilter,
      createdAt: Date.now()
    }

    setWebhooks((current) => [...(current || []), newWebhook])
    
    setFormData({
      name: '',
      provider: 'slack',
      url: '',
      enabled: true,
      severityFilter: ['critical', 'warning', 'info']
    })
    
    setShowDialog(false)
    toast.success('Webhook added successfully')
    onWebhookAdded?.()
  }

  const handleDeleteWebhook = (id: string) => {
    setWebhooks((current) => (current || []).filter(w => w.id !== id))
    toast.success('Webhook deleted')
  }

  const handleToggleWebhook = (id: string) => {
    setWebhooks((current) =>
      (current || []).map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    )
    toast.success('Webhook updated')
  }

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    setTesting(webhook.id)
    try {
      const success = await testWebhook(webhook)
      if (success) {
        toast.success('Test webhook sent successfully')
      } else {
        toast.error('Failed to send test webhook')
      }
    } catch (error) {
      toast.error('Error testing webhook')
    } finally {
      setTesting(null)
    }
  }

  const toggleSeverity = (severity: RuleSeverity) => {
    setFormData(prev => ({
      ...prev,
      severityFilter: prev.severityFilter.includes(severity)
        ? prev.severityFilter.filter(s => s !== severity)
        : [...prev.severityFilter, severity]
    }))
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
              Send alerts to Slack or PagerDuty when rules are triggered
            </CardDescription>
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} weight="bold" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Webhook Integration</DialogTitle>
                <DialogDescription>
                  Configure a new webhook to receive alert notifications
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Name</Label>
                  <Input
                    id="webhook-name"
                    placeholder="Production Alerts"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-provider">Provider</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value: 'slack' | 'pagerduty') =>
                      setFormData({ ...formData, provider: value })
                    }
                  >
                    <SelectTrigger id="webhook-provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="pagerduty">PagerDuty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder={
                      formData.provider === 'slack'
                        ? 'https://hooks.slack.com/services/...'
                        : 'https://events.pagerduty.com/v2/enqueue'
                    }
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.provider === 'slack' && 'Get your webhook URL from Slack App settings'}
                    {formData.provider === 'pagerduty' && 'Include routing_key as query parameter'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Severity Filter</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Select which alert severities to send
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.severityFilter.includes('critical') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSeverity('critical')}
                    >
                      Critical
                    </Button>
                    <Button
                      type="button"
                      variant={formData.severityFilter.includes('warning') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSeverity('warning')}
                    >
                      Warning
                    </Button>
                    <Button
                      type="button"
                      variant={formData.severityFilter.includes('info') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSeverity('info')}
                    >
                      Info
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="webhook-enabled">Enable webhook</Label>
                  <Switch
                    id="webhook-enabled"
                    checked={formData.enabled}
                    onCheckedChange={(enabled) => setFormData({ ...formData, enabled })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWebhook}>Add Webhook</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {!webhooks || webhooks.length === 0 ? (
          <div className="text-center py-12">
            <Broadcast size={48} weight="thin" className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a webhook to start sending alerts to Slack or PagerDuty
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{webhook.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {webhook.provider}
                      </Badge>
                      {webhook.enabled ? (
                        <Badge variant="default" className="text-xs bg-success text-success-foreground">
                          <CheckCircle size={12} weight="bold" className="mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Warning size={12} weight="bold" className="mr-1" />
                          Disabled
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono break-all">
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
