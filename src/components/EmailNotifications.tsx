import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  EnvelopeSimple, 
  Plus, 
  Trash, 
  CheckCircle,
  XCircle,
  PaperPlaneTilt,
  Bell,
  Warning,
  Info
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { emailNotificationService } from '@/lib/email-notifications'
import type { EmailNotificationConfig, EmailNotificationLog, RuleSeverity } from '@/lib/types'

export function EmailNotifications() {
  const [configs, setConfigs] = useKV<EmailNotificationConfig[]>('email-notification-configs', [])
  const [logs, setLogs] = useKV<EmailNotificationLog[]>('email-notification-logs', [])
  
  const [newEmail, setNewEmail] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [testingEmail, setTestingEmail] = useState<string | null>(null)

  const handleAddConfig = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    const existingConfig = (configs || []).find(c => c.email === newEmail)
    if (existingConfig) {
      toast.error('This email is already configured')
      return
    }

    const newConfig: EmailNotificationConfig = {
      id: `email_config_${Date.now()}`,
      email: newEmail,
      enabled: true,
      severityFilter: ['critical', 'warning'],
      notifyOnIncidentCreated: true,
      notifyOnIncidentResolved: true,
      notifyOnAlerts: true,
      createdAt: Date.now()
    }

    setConfigs((current) => [...(current || []), newConfig])
    setNewEmail('')
    setIsAdding(false)
    toast.success('Email notification configured')
  }

  const handleRemoveConfig = (id: string) => {
    setConfigs((current) => (current || []).filter(c => c.id !== id))
    toast.success('Email notification removed')
  }

  const handleToggleEnabled = (id: string) => {
    setConfigs((current) =>
      (current || []).map(c =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      )
    )
  }

  const handleToggleSeverity = (id: string, severity: RuleSeverity) => {
    setConfigs((current) =>
      (current || []).map(c => {
        if (c.id === id) {
          const severityFilter = c.severityFilter.includes(severity)
            ? c.severityFilter.filter(s => s !== severity)
            : [...c.severityFilter, severity]
          return { ...c, severityFilter }
        }
        return c
      })
    )
  }

  const handleToggleNotificationType = (
    id: string, 
    type: 'notifyOnIncidentCreated' | 'notifyOnIncidentResolved' | 'notifyOnAlerts'
  ) => {
    setConfigs((current) =>
      (current || []).map(c =>
        c.id === id ? { ...c, [type]: !c[type] } : c
      )
    )
  }

  const handleTestEmail = async (email: string) => {
    setTestingEmail(email)
    try {
      const log = await emailNotificationService.testEmailConfiguration(email)
      setLogs((current) => [log, ...(current || [])].slice(0, 50))
      
      if (log.status === 'sent') {
        toast.success(`Test email sent to ${email}`)
      } else {
        toast.error(`Failed to send test email: ${log.errorMessage}`)
      }
    } catch (error) {
      toast.error('Failed to send test email')
    } finally {
      setTestingEmail(null)
    }
  }

  const recentLogs = (logs || []).slice(0, 10)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EnvelopeSimple size={24} weight="fill" className="text-primary" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure email notifications for critical incidents and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="w-full gap-2">
              <Plus size={18} />
              Add Email Recipient
            </Button>
          )}

          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 p-4 border border-border rounded-lg bg-card/50"
            >
              <div className="space-y-2">
                <Label htmlFor="new-email">Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="engineer@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddConfig()}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddConfig} className="flex-1 gap-2">
                  <Plus size={18} />
                  Add Recipient
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAdding(false)
                    setNewEmail('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {(configs || []).length === 0 && !isAdding && (
            <div className="text-center py-8 text-muted-foreground">
              <EnvelopeSimple size={48} className="mx-auto mb-3 opacity-50" />
              <p>No email notifications configured</p>
              <p className="text-sm mt-1">Add email recipients to receive incident alerts</p>
            </div>
          )}

          <div className="space-y-4">
            {(configs || []).map((config) => (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-border rounded-lg bg-card space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <EnvelopeSimple 
                      size={24} 
                      weight="fill" 
                      className={config.enabled ? 'text-primary' : 'text-muted-foreground'} 
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{config.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Added {new Date(config.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={() => handleToggleEnabled(config.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveConfig(config.id)}
                    >
                      <Trash size={18} className="text-destructive" />
                    </Button>
                  </div>
                </div>

                {config.enabled && (
                  <>
                    <Separator />

                    <div className="space-y-3">
                      <div className="text-sm font-semibold">Notification Types</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-normal">Incident Created</Label>
                          <Switch
                            checked={config.notifyOnIncidentCreated}
                            onCheckedChange={() => 
                              handleToggleNotificationType(config.id, 'notifyOnIncidentCreated')
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-normal">Incident Resolved</Label>
                          <Switch
                            checked={config.notifyOnIncidentResolved}
                            onCheckedChange={() => 
                              handleToggleNotificationType(config.id, 'notifyOnIncidentResolved')
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-normal">Alert Triggered</Label>
                          <Switch
                            checked={config.notifyOnAlerts}
                            onCheckedChange={() => 
                              handleToggleNotificationType(config.id, 'notifyOnAlerts')
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="text-sm font-semibold">Severity Filter</div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge
                          variant={config.severityFilter.includes('critical') ? 'default' : 'outline'}
                          className="cursor-pointer gap-1"
                          onClick={() => handleToggleSeverity(config.id, 'critical')}
                        >
                          <Bell size={14} />
                          Critical
                        </Badge>
                        <Badge
                          variant={config.severityFilter.includes('warning') ? 'default' : 'outline'}
                          className="cursor-pointer gap-1"
                          onClick={() => handleToggleSeverity(config.id, 'warning')}
                        >
                          <Warning size={14} />
                          Warning
                        </Badge>
                        <Badge
                          variant={config.severityFilter.includes('info') ? 'default' : 'outline'}
                          className="cursor-pointer gap-1"
                          onClick={() => handleToggleSeverity(config.id, 'info')}
                        >
                          <Info size={14} />
                          Info
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Click to toggle severity levels
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleTestEmail(config.email)}
                      disabled={testingEmail === config.email}
                    >
                      <PaperPlaneTilt size={16} />
                      {testingEmail === config.email ? 'Sending Test...' : 'Send Test Email'}
                    </Button>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {recentLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Email Activity
            </CardTitle>
            <CardDescription>
              Last {recentLogs.length} email notifications sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg bg-card/50"
                >
                  {log.status === 'sent' ? (
                    <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={20} weight="fill" className="text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{log.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      To: {log.email} • {new Date(log.sentAt).toLocaleString()}
                    </div>
                    {log.errorMessage && (
                      <div className="text-xs text-destructive mt-1">
                        Error: {log.errorMessage}
                      </div>
                    )}
                  </div>
                  <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                    {log.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
