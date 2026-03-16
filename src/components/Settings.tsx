import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Webhooks } from '@/components/Webhooks'
import { WebhookStatus } from '@/components/WebhookStatus'
import { AutoCaptureSettings } from '@/components/AutoCaptureSettings'
import { EmailNotifications } from '@/components/EmailNotifications'
import { EmailDigestSettings } from '@/components/EmailDigestSettings'
import { AWSNovaSettings } from '@/components/AWSNovaSettings'
import type { Incident, Alert as AlertType, TelemetryMetric } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { Waveform, Webhook, Screenshot, Envelope, CalendarDots } from '@phosphor-icons/react'

interface SettingsProps {
  incidents?: Incident[]
  alerts?: AlertType[]
  metrics?: TelemetryMetric[]
}

export function Settings({ incidents = [], alerts = [], metrics = [] }: SettingsProps = {}) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useKV<boolean>('has-seen-onboarding-v3', false)

  const handleResetOnboarding = () => {
    setHasSeenOnboarding(false)
    toast.success('Onboarding reset! Refresh the page to see it again.')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage AWS Nova configuration, webhooks, and notification preferences.
          </p>
        </div>
        <Button variant="outline" onClick={handleResetOnboarding} size="sm">
          Reset Onboarding
        </Button>
      </div>

      <Tabs defaultValue="aws-nova" className="space-y-6">
        <TabsList>
          <TabsTrigger value="aws-nova" className="gap-2">
            <Waveform size={16} />
            AWS Nova
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook size={16} />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="webhook-status" className="gap-2">
            <Webhook size={16} />
            Status
          </TabsTrigger>
          <TabsTrigger value="capture" className="gap-2">
            <Screenshot size={16} />
            Capture
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Envelope size={16} />
            Email
          </TabsTrigger>
          <TabsTrigger value="digest" className="gap-2">
            <CalendarDots size={16} />
            Digest
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aws-nova" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">AWS Nova 2 Sonic Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Configure AWS Bedrock credentials for AWS Nova 2 Sonic speech-to-speech AI
            </p>
          </div>
          <AWSNovaSettings />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Webhook Integrations</h3>
            <p className="text-sm text-muted-foreground">
              Configure webhook endpoints for Slack, Discord, PagerDuty, and Microsoft Teams
            </p>
          </div>
          <Webhooks />
        </TabsContent>

        <TabsContent value="webhook-status" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Webhook Delivery Status</h3>
            <p className="text-muted-foreground">
              Monitor webhook delivery success rates and recent activity
            </p>
          </div>
          <WebhookStatus />
        </TabsContent>

        <TabsContent value="capture" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Auto-Capture Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure automatic screenshot capture for incidents and alerts
            </p>
          </div>
          <AutoCaptureSettings />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Configure email recipients and notification preferences for alerts and incidents
            </p>
          </div>
          <EmailNotifications
            incidents={incidents}
            alerts={alerts}
          />
        </TabsContent>

        <TabsContent value="digest" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Email Digest Schedule</h3>
            <p className="text-sm text-muted-foreground">
              Configure automated email digests for daily or weekly incident summaries
            </p>
          </div>
          <EmailDigestSettings
            incidents={incidents}
            alerts={alerts}
            metrics={metrics}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
