import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Envelope, Broadcast, Microphone, MoonStars, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { NotificationPreference, RuleSeverity } from '@/lib/types'

interface NotificationPreferencesProps {
  preferences: NotificationPreference
  onUpdate: (preferences: NotificationPreference) => void
}

export function NotificationPreferences({ preferences, onUpdate }: NotificationPreferencesProps) {
  const [quietStart, setQuietStart] = useState(preferences.quietHours?.start || '22:00')
  const [quietEnd, setQuietEnd] = useState(preferences.quietHours?.end || '08:00')
  const [groupingWindow, setGroupingWindow] = useState(preferences.grouping?.windowMinutes || 5)

  const updateChannel = (channel: keyof NotificationPreference['channels'], enabled: boolean) => {
    onUpdate({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: enabled,
      },
    })
  }

  const updateQuietHours = () => {
    onUpdate({
      ...preferences,
      quietHours: {
        enabled: preferences.quietHours?.enabled || false,
        start: quietStart,
        end: quietEnd,
      },
    })
    toast.success('Quiet hours updated')
  }

  const updateGrouping = () => {
    onUpdate({
      ...preferences,
      grouping: {
        enabled: preferences.grouping?.enabled || false,
        windowMinutes: groupingWindow,
      },
    })
    toast.success('Notification grouping updated')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Notification Preferences</h2>
        <p className="text-muted-foreground">
          Control how and when you receive alerts and notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} weight="fill" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose which channels should receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell size={20} className="text-primary" />
              </div>
              <div>
                <div className="font-medium">In-App Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Toast notifications and dashboard alerts
                </div>
              </div>
            </div>
            <Switch
              checked={preferences.channels.inApp}
              onCheckedChange={(checked) => updateChannel('inApp', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Envelope size={20} className="text-accent" />
              </div>
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Send alerts to configured email addresses
                </div>
              </div>
            </div>
            <Switch
              checked={preferences.channels.email}
              onCheckedChange={(checked) => updateChannel('email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Broadcast size={20} className="text-success" />
              </div>
              <div>
                <div className="font-medium">Webhook Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Send to Slack, Discord, and other integrations
                </div>
              </div>
            </div>
            <Switch
              checked={preferences.channels.webhook}
              onCheckedChange={(checked) => updateChannel('webhook', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cost/10 flex items-center justify-center">
                <Microphone size={20} className="text-cost" />
              </div>
              <div>
                <div className="font-medium">Voice Alerts</div>
                <div className="text-sm text-muted-foreground">
                  Spoken notifications for critical alerts
                </div>
              </div>
            </div>
            <Switch
              checked={preferences.channels.voice}
              onCheckedChange={(checked) => updateChannel('voice', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="w-6 h-6 p-0 flex items-center justify-center">!</Badge>
            Severity Threshold
          </CardTitle>
          <CardDescription>
            Only send notifications for alerts at or above this severity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={preferences.severityThreshold} 
            onValueChange={(v) => onUpdate({ ...preferences, severityThreshold: v as RuleSeverity })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info and above (all alerts)</SelectItem>
              <SelectItem value="warning">Warning and above</SelectItem>
              <SelectItem value="critical">Critical only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MoonStars size={20} weight="fill" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Suppress non-critical notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-enabled">Enable Quiet Hours</Label>
            <Switch
              id="quiet-enabled"
              checked={preferences.quietHours?.enabled || false}
              onCheckedChange={(checked) => {
                onUpdate({
                  ...preferences,
                  quietHours: {
                    ...preferences.quietHours!,
                    enabled: checked,
                    start: quietStart,
                    end: quietEnd,
                  },
                })
              }}
            />
          </div>

          {preferences.quietHours?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Start Time</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  onBlur={updateQuietHours}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">End Time</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  onBlur={updateQuietHours}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} weight="fill" />
            Notification Grouping
          </CardTitle>
          <CardDescription>
            Group multiple alerts into single notifications to reduce noise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="grouping-enabled">Enable Grouping</Label>
            <Switch
              id="grouping-enabled"
              checked={preferences.grouping?.enabled || false}
              onCheckedChange={(checked) => {
                onUpdate({
                  ...preferences,
                  grouping: {
                    ...preferences.grouping!,
                    enabled: checked,
                    windowMinutes: groupingWindow,
                  },
                })
              }}
            />
          </div>

          {preferences.grouping?.enabled && (
            <div className="space-y-2">
              <Label htmlFor="grouping-window">Grouping Window (minutes)</Label>
              <div className="flex gap-2">
                <Input
                  id="grouping-window"
                  type="number"
                  min="1"
                  max="60"
                  value={groupingWindow}
                  onChange={(e) => setGroupingWindow(parseInt(e.target.value) || 5)}
                />
                <Button onClick={updateGrouping}>Update</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Alerts within {groupingWindow} minutes will be combined into one notification
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
