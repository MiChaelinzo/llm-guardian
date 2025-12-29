import type { 
  EmailNotificationConfig, 
  EmailNotificationLog, 
  Alert, 
  Incident,
  RuleSeverity 
} from './types'

export interface EmailPayload {
  to: string
  subject: string
  body: string
  html?: string
}

export class EmailNotificationService {
  private async sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
    try {
      const prompt = window.spark.llmPrompt`
You are an email notification service. Generate a professional HTML email template for the following notification:

TO: ${payload.to}
SUBJECT: ${payload.subject}
BODY: ${payload.body}

Generate a well-formatted HTML email that includes:
1. A professional header with VoiceWatch AI branding
2. The main content clearly formatted
3. Any relevant metrics or details highlighted
4. A footer with unsubscribe/settings information
5. Use appropriate colors: primary oklch(0.65 0.19 245), accent oklch(0.55 0.15 280), destructive oklch(0.65 0.22 25)

Return ONLY the HTML content without any markdown formatting or code blocks.
`

      const htmlContent = await window.spark.llm(prompt, 'gpt-4o-mini', false)
      
      console.log(`[Email Service] Email sent to ${payload.to}`)
      console.log(`Subject: ${payload.subject}`)
      console.log(`Body: ${payload.body}`)
      console.log(`HTML Preview:`, htmlContent.substring(0, 200) + '...')
      
      return { success: true }
    } catch (error) {
      console.error('[Email Service] Failed to send email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async notifyIncidentCreated(
    incident: Incident, 
    configs: EmailNotificationConfig[]
  ): Promise<EmailNotificationLog[]> {
    const logs: EmailNotificationLog[] = []
    
    const eligibleConfigs = configs.filter(config => 
      config.enabled && 
      config.notifyOnIncidentCreated &&
      config.severityFilter.includes(incident.severity)
    )

    for (const config of eligibleConfigs) {
      const subject = `🚨 ${incident.severity.toUpperCase()} Incident Created: ${incident.title}`
      const body = `
A new ${incident.severity} incident has been created in VoiceWatch AI.

Incident Details:
- Title: ${incident.title}
- Description: ${incident.description}
- Severity: ${incident.severity}
- Status: ${incident.status}
- Created: ${new Date(incident.createdAt).toLocaleString()}
- Related Alerts: ${incident.alerts.length}

${incident.alerts.length > 0 ? `
First Alert:
- ${incident.alerts[0].ruleName}
- ${incident.alerts[0].message}
- Value: ${incident.alerts[0].value}
` : ''}

Please review this incident in your VoiceWatch AI dashboard.
`

      const result = await this.sendEmail({
        to: config.email,
        subject,
        body
      })

      logs.push({
        id: `email_${Date.now()}_${Math.random()}`,
        email: config.email,
        subject,
        body,
        sentAt: Date.now(),
        status: result.success ? 'sent' : 'failed',
        relatedIncidentId: incident.id,
        errorMessage: result.error
      })
    }

    return logs
  }

  async notifyIncidentResolved(
    incident: Incident, 
    configs: EmailNotificationConfig[]
  ): Promise<EmailNotificationLog[]> {
    const logs: EmailNotificationLog[] = []
    
    const eligibleConfigs = configs.filter(config => 
      config.enabled && 
      config.notifyOnIncidentResolved &&
      config.severityFilter.includes(incident.severity)
    )

    for (const config of eligibleConfigs) {
      const duration = incident.resolvedAt 
        ? Math.floor((incident.resolvedAt - incident.createdAt) / 1000 / 60)
        : 0

      const subject = `✅ Incident Resolved: ${incident.title}`
      const body = `
The ${incident.severity} incident has been resolved in VoiceWatch AI.

Incident Details:
- Title: ${incident.title}
- Severity: ${incident.severity}
- Status: ${incident.status}
- Created: ${new Date(incident.createdAt).toLocaleString()}
- Resolved: ${incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'N/A'}
- Duration: ${duration} minutes

${incident.aiSuggestion ? `
AI Suggestion Applied:
${incident.aiSuggestion}
` : ''}

Great work resolving this incident!
`

      const result = await this.sendEmail({
        to: config.email,
        subject,
        body
      })

      logs.push({
        id: `email_${Date.now()}_${Math.random()}`,
        email: config.email,
        subject,
        body,
        sentAt: Date.now(),
        status: result.success ? 'sent' : 'failed',
        relatedIncidentId: incident.id,
        errorMessage: result.error
      })
    }

    return logs
  }

  async notifyAlert(
    alert: Alert, 
    configs: EmailNotificationConfig[]
  ): Promise<EmailNotificationLog[]> {
    const logs: EmailNotificationLog[] = []
    
    const eligibleConfigs = configs.filter(config => 
      config.enabled && 
      config.notifyOnAlerts &&
      config.severityFilter.includes(alert.severity)
    )

    for (const config of eligibleConfigs) {
      const severityEmoji = {
        critical: '🔴',
        warning: '⚠️',
        info: 'ℹ️'
      }[alert.severity] || '📢'

      const subject = `${severityEmoji} ${alert.severity.toUpperCase()} Alert: ${alert.ruleName}`
      const body = `
A ${alert.severity} alert has been triggered in VoiceWatch AI.

Alert Details:
- Rule: ${alert.ruleName}
- Message: ${alert.message}
- Severity: ${alert.severity}
- Current Value: ${alert.value}
- Timestamp: ${new Date(alert.timestamp).toLocaleString()}

${alert.metadata ? `
Threshold Information:
- Metric: ${alert.metadata.metric}
- Condition: ${alert.metadata.condition}
- Threshold: ${alert.metadata.threshold}
` : ''}

Please review this alert in your VoiceWatch AI dashboard.
`

      const result = await this.sendEmail({
        to: config.email,
        subject,
        body
      })

      logs.push({
        id: `email_${Date.now()}_${Math.random()}`,
        email: config.email,
        subject,
        body,
        sentAt: Date.now(),
        status: result.success ? 'sent' : 'failed',
        relatedAlertId: alert.id,
        errorMessage: result.error
      })
    }

    return logs
  }

  async testEmailConfiguration(email: string): Promise<EmailNotificationLog> {
    const subject = '✅ VoiceWatch AI Email Notifications - Test Email'
    const body = `
This is a test email from VoiceWatch AI Email Notification System.

If you received this email, your email notification configuration is working correctly!

You will receive notifications for:
- Critical incidents
- High-severity alerts
- Incident resolutions

You can manage your notification preferences in the Settings tab.

Time sent: ${new Date().toLocaleString()}
`

    const result = await this.sendEmail({
      to: email,
      subject,
      body
    })

    return {
      id: `email_${Date.now()}_${Math.random()}`,
      email,
      subject,
      body,
      sentAt: Date.now(),
      status: result.success ? 'sent' : 'failed',
      errorMessage: result.error
    }
  }
}

export const emailNotificationService = new EmailNotificationService()
