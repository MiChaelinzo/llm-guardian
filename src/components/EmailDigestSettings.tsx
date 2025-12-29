import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Plus, Trash, EnvelopeSimple, Clock, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { DigestConfig } from '@/lib/email-digest'
import type { Incident, Alert, TelemetryMetric } from '@/lib/types'
import { emailDigestService } from '@/lib/email-digest'
import { calculateMetrics } from '@/lib/metrics'
import { DigestPreview } from '@/components/DigestPreview'

interface EmailDigestSettingsProps {
  incidents: Incident[]
  alerts: Alert[]
  metrics: TelemetryMetric[]
}

export function EmailDigestSettings({ incidents, alerts, metrics }: EmailDigestSettingsProps) {
  const [digestConfigs, setDigestConfigs] = useKV<DigestConfig[]>('email-digest-configs', [])
  const [newEmail, setNewEmail] = useState('')
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly'>('daily')
  const [newSendTime, setNewSendTime] = useState('09:00')
  const [isAddingConfig, setIsAddingConfig] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState<string | null>(null)
  const [previewConfigId, setPreviewConfigId] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)

  const handleAddConfig = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    const newConfig: DigestConfig = {
      id: `digest_${Date.now()}`,
      email: newEmail,
      frequency: newFrequency,
      enabled: true,
      includeIncidents: true,
      includeAlerts: true,
      includeMetrics: true,
      includeTrends: true,
      sendTime: newSendTime,
      createdAt: Date.now()
    }

    setDigestConfigs((current) => [...(current || []), newConfig])
    toast.success('Email digest configuration added')
    
    setNewEmail('')
    setNewFrequency('daily')
    setNewSendTime('09:00')
    setIsAddingConfig(false)
  }

  const handleToggleConfig = (configId: string) => {
    setDigestConfigs((current) =>
      (current || []).map(c =>
        c.id === configId ? { ...c, enabled: !c.enabled } : c
      )
    )
  }

  const handleDeleteConfig = (configId: string) => {
    setDigestConfigs((current) => (current || []).filter(c => c.id !== configId))
    toast.success('Digest configuration deleted')
  }

  const handleUpdateConfig = (configId: string, updates: Partial<DigestConfig>) => {
    setDigestConfigs((current) =>
      (current || []).map(c =>
        c.id === configId ? { ...c, ...updates } : c
      )
    )
  }

  const handleSendTestDigest = async (configId: string) => {
    const config = (digestConfigs || []).find(c => c.id === configId)
    if (!config) return

    setIsSendingTest(configId)
    
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

      await emailDigestService.sendDigest(config, digestData)
      
      toast.success(`Test digest sent to ${config.email}`)
    } catch (error) {
      console.error('Failed to send test digest:', error)
      toast.error('Failed to send test digest')
    } finally {
      setIsSendingTest(null)
    }
  }

  const handlePreviewDigest = (configId: string) => {
    const config = (digestConfigs || []).find(c => c.id === configId)
    if (!config) return

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

    setPreviewConfigId(configId)
    setPreviewData(digestData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EnvelopeSimple size={24} weight="fill" />
          Email Digest Settings
        </CardTitle>
        <CardDescription>
          Configure automated daily or weekly email summaries of incidents, alerts, and metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {(digestConfigs || []).length === 0 && !isAddingConfig && (
            <div className="text-center py-8 text-muted-foreground">
              <EnvelopeSimple size={48} className="mx-auto mb-4 opacity-50" />
              <p>No email digest configurations yet</p>
              <p className="text-sm">Add a configuration to receive automated summaries</p>
            </div>
          )}

          {(digestConfigs || []).map((config) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-border rounded-lg space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{config.email}</span>
                    <Badge variant={config.enabled ? 'default' : 'secondary'}>
                      {config.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                    <Badge variant="outline">
                      {config.frequency}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={14} />
                    Sends at {config.sendTime}
                    {config.lastSentAt && (
                      <span className="ml-2">
                        • Last sent: {new Date(config.lastSentAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={() => handleToggleConfig(config.id)}
                  />
                  {previewData && previewConfigId === config.id && (
                    <DigestPreview data={previewData} frequency={config.frequency} />
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreviewDigest(config.id)}
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendTestDigest(config.id)}
                    disabled={isSendingTest === config.id}
                  >
                    {isSendingTest === config.id ? 'Sending...' : 'Send Test'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteConfig(config.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`frequency-${config.id}`}>Frequency</Label>
                  <Select
                    value={config.frequency}
                    onValueChange={(value: 'daily' | 'weekly') =>
                      handleUpdateConfig(config.id, { frequency: value })
                    }
                  >
                    <SelectTrigger id={`frequency-${config.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`sendtime-${config.id}`}>Send Time</Label>
                  <Input
                    id={`sendtime-${config.id}`}
                    type="time"
                    value={config.sendTime}
                    onChange={(e) =>
                      handleUpdateConfig(config.id, { sendTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Include in Digest</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.includeIncidents}
                      onCheckedChange={(checked) =>
                        handleUpdateConfig(config.id, { includeIncidents: checked })
                      }
                    />
                    <Label className="text-sm font-normal">Incidents Summary</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.includeAlerts}
                      onCheckedChange={(checked) =>
                        handleUpdateConfig(config.id, { includeAlerts: checked })
                      }
                    />
                    <Label className="text-sm font-normal">Alerts Summary</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.includeMetrics}
                      onCheckedChange={(checked) =>
                        handleUpdateConfig(config.id, { includeMetrics: checked })
                      }
                    />
                    <Label className="text-sm font-normal">Performance Metrics</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.includeTrends}
                      onCheckedChange={(checked) =>
                        handleUpdateConfig(config.id, { includeTrends: checked })
                      }
                    />
                    <Label className="text-sm font-normal">Trends Analysis</Label>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {isAddingConfig && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-primary rounded-lg space-y-4"
            >
              <h3 className="font-semibold">New Digest Configuration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="new-email">Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-frequency">Frequency</Label>
                  <Select value={newFrequency} onValueChange={(value) => setNewFrequency(value as 'daily' | 'weekly')}>
                    <SelectTrigger id="new-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-sendtime">Send Time</Label>
                  <Input
                    id="new-sendtime"
                    type="time"
                    value={newSendTime}
                    onChange={(e) => setNewSendTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddConfig} className="gap-2">
                  <CheckCircle size={16} />
                  Add Configuration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingConfig(false)
                    setNewEmail('')
                    setNewFrequency('daily')
                    setNewSendTime('09:00')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {!isAddingConfig && (
            <Button
              onClick={() => setIsAddingConfig(true)}
              variant="outline"
              className="w-full gap-2"
            >
              <Plus size={18} />
              Add Digest Configuration
            </Button>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">How it works</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Digests are automatically sent at your specified time</li>
            <li>Daily digests cover the past 24 hours</li>
            <li>Weekly digests cover the past 7 days</li>
            <li>Customize what information is included in each digest</li>
            <li>Test digests are sent immediately for preview</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
