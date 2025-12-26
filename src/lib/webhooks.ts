import type { Alert, WebhookConfig } from './types'

interface SlackAttachment {
  color: string
  title: string
  text: string
  fields: Array<{
    title: string
    value: string
    short: boolean
  }>
  footer: string
  ts: number
}

interface SlackPayload {
  text: string
  attachments: SlackAttachment[]
}

interface PagerDutyPayload {
  routing_key: string
  event_action: 'trigger'
  payload: {
    summary: string
    severity: 'critical' | 'error' | 'warning' | 'info'
    source: string
    timestamp: string
    custom_details: Record<string, any>
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#e74856'
    case 'warning':
      return '#f5b942'
    case 'info':
      return '#4d8cff'
    default:
      return '#808080'
  }
}

function formatSlackPayload(alert: Alert): SlackPayload {
  const emoji = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'
  
  const attachment: SlackAttachment = {
    color: getSeverityColor(alert.severity),
    title: `${emoji} ${alert.ruleName}`,
    text: alert.message,
    fields: [
      {
        title: 'Severity',
        value: alert.severity.toUpperCase(),
        short: true
      },
      {
        title: 'Current Value',
        value: alert.value.toFixed(2),
        short: true
      }
    ],
    footer: 'VoiceWatch AI',
    ts: Math.floor(alert.timestamp / 1000)
  }

  if (alert.metadata) {
    attachment.fields.push(
      {
        title: 'Metric',
        value: alert.metadata.metric,
        short: true
      },
      {
        title: 'Threshold',
        value: `${alert.metadata.condition} ${alert.metadata.threshold}`,
        short: true
      }
    )
  }

  return {
    text: `*VoiceWatch AI Alert*: ${alert.ruleName}`,
    attachments: [attachment]
  }
}

function formatPagerDutyPayload(alert: Alert, routingKey: string): PagerDutyPayload {
  return {
    routing_key: routingKey,
    event_action: 'trigger',
    payload: {
      summary: `${alert.ruleName}: ${alert.message}`,
      severity: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info',
      source: 'VoiceWatch AI',
      timestamp: new Date(alert.timestamp).toISOString(),
      custom_details: {
        alert_id: alert.id,
        rule_id: alert.ruleId,
        rule_name: alert.ruleName,
        current_value: alert.value,
        metric: alert.metadata?.metric,
        threshold: alert.metadata?.threshold,
        condition: alert.metadata?.condition
      }
    }
  }
}

export async function sendWebhook(webhook: WebhookConfig, alert: Alert): Promise<boolean> {
  if (!webhook.enabled) {
    return false
  }

  if (!webhook.severityFilter.includes(alert.severity)) {
    return false
  }

  try {
    let payload: any
    let headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (webhook.provider === 'slack') {
      payload = formatSlackPayload(alert)
    } else if (webhook.provider === 'pagerduty') {
      const routingKey = new URL(webhook.url).searchParams.get('routing_key') || 'unknown'
      payload = formatPagerDutyPayload(alert, routingKey)
    } else {
      return false
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    return response.ok
  } catch (error) {
    console.error(`Webhook delivery failed for ${webhook.name}:`, error)
    return false
  }
}

export async function testWebhook(webhook: WebhookConfig): Promise<boolean> {
  const testAlert: Alert = {
    id: 'test_alert',
    ruleId: 'test_rule',
    ruleName: 'Test Alert',
    message: 'This is a test alert from VoiceWatch AI',
    severity: 'info',
    timestamp: Date.now(),
    value: 100,
    metadata: {
      metric: 'avgLatency',
      threshold: 500,
      condition: 'gt'
    },
    acknowledged: false
  }

  return sendWebhook(webhook, testAlert)
}
