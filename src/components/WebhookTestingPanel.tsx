import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { WebhookTester } from '@/components/WebhookTester'
import { Flask, CheckCircle, XCircle, Clock, Broadcast, Info } from '@phosphor-icons/react'
import type { WebhookConfig } from '@/lib/types'

interface WebhookHealth {
  webhookId: string
  lastTestTime?: number
  lastTestSuccess?: boolean
  totalTests: number
  successCount: number
  avgResponseTime: number
}

export function WebhookTestingPanel() {
  const [webhooks] = useKV<WebhookConfig[]>('webhooks', [])
  const [webhookHealth, setWebhookHealth] = useKV<Record<string, WebhookHealth>>('webhook-health', {})
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null)

  useEffect(() => {
    if (webhooks && webhooks.length > 0 && !selectedWebhook) {
      setSelectedWebhook(webhooks[0].id)
    }
  }, [webhooks, selectedWebhook])

  const getWebhookHealth = (webhookId: string): WebhookHealth => {
    return webhookHealth?.[webhookId] || {
      webhookId,
      totalTests: 0,
      successCount: 0,
      avgResponseTime: 0
    }
  }

  const getHealthBadge = (health: WebhookHealth) => {
    if (health.totalTests === 0) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock size={14} />
          Not Tested
        </Badge>
      )
    }

    const successRate = (health.successCount / health.totalTests) * 100
    
    if (successRate >= 90) {
      return (
        <Badge variant="outline" className="text-success gap-1">
          <CheckCircle size={14} weight="fill" />
          Healthy
        </Badge>
      )
    } else if (successRate >= 50) {
      return (
        <Badge variant="outline" className="text-warning gap-1">
          <Clock size={14} weight="fill" />
          Degraded
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="text-destructive gap-1">
          <XCircle size={14} weight="fill" />
          Unhealthy
        </Badge>
      )
    }
  }

  const selectedWebhookConfig = webhooks?.find(w => w.id === selectedWebhook)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flask size={24} weight="bold" />
            Webhook Integration Testing
          </CardTitle>
          <CardDescription>
            Test and monitor webhook endpoint connectivity in real-time
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!webhooks || webhooks.length === 0 ? (
            <Alert>
              <Info size={18} />
              <AlertDescription>
                No webhooks configured. Go to the Settings tab to add webhook integrations first.
              </AlertDescription>
            </Alert>
          ) : (
            <Tabs value={selectedWebhook || ''} onValueChange={setSelectedWebhook}>
              <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
                {webhooks.map((webhook) => {
                  const health = getWebhookHealth(webhook.id)
                  return (
                    <TabsTrigger
                      key={webhook.id}
                      value={webhook.id}
                      className="flex items-center gap-2"
                    >
                      <Broadcast size={16} />
                      <span>{webhook.name}</span>
                      {health.totalTests > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {health.successCount}/{health.totalTests}
                        </Badge>
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {webhooks.map((webhook) => (
                <TabsContent key={webhook.id} value={webhook.id} className="space-y-4 mt-6">
                  <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Provider</span>
                        <p className="font-medium capitalize">{webhook.provider}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Status</span>
                        <div className="flex items-center gap-2 mt-1">
                          {webhook.enabled ? (
                            <Badge variant="outline" className="text-success">
                              <CheckCircle size={14} weight="fill" className="mr-1" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Disabled
                            </Badge>
                          )}
                          {getHealthBadge(getWebhookHealth(webhook.id))}
                        </div>
                      </div>
                    </div>

                    <Separator orientation="vertical" className="hidden md:block" />

                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Severity Filters</span>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {webhook.severityFilter.map((severity) => (
                            <Badge key={severity} variant="secondary" className="text-xs">
                              {severity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Endpoint</span>
                        <p className="font-mono text-xs break-all">{webhook.url}</p>
                      </div>
                    </div>
                  </div>

                  {webhook.enabled ? (
                    <WebhookTester webhook={webhook} />
                  ) : (
                    <Alert>
                      <Info size={18} />
                      <AlertDescription>
                        This webhook is currently disabled. Enable it in the Settings tab to test connectivity.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {webhooks && webhooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Webhook Health Overview</CardTitle>
            <CardDescription>
              Real-time status and performance metrics for all configured webhooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {webhooks.map((webhook) => {
                const health = getWebhookHealth(webhook.id)
                const successRate = health.totalTests > 0 
                  ? (health.successCount / health.totalTests) * 100 
                  : 0

                return (
                  <div key={webhook.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{webhook.name}</h4>
                          {getHealthBadge(health)}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {webhook.provider}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedWebhook(webhook.id)}
                      >
                        <Flask size={16} />
                        Test
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Tests</p>
                        <p className="text-lg font-bold">{health.totalTests}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                        <p className="text-lg font-bold">
                          {health.totalTests > 0 ? `${successRate.toFixed(0)}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Response</p>
                        <p className="text-lg font-bold">
                          {health.totalTests > 0 ? `${health.avgResponseTime.toFixed(0)}ms` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {health.lastTestTime && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Last tested: {new Date(health.lastTestTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
