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

interface TeamsPayload {
  '@type': 'MessageCard'
  '@context': 'https://schema.org/extensions'
  summary: string
  themeColor: string
  title: string
  sections: Array<{
    activityTitle?: string
    activitySubtitle?: string
    facts: Array<{
      name: string
      value: string
    }>
    text?: string
  }>
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

function formatTeamsPayload(alert: Alert): TeamsPayload {
  const emoji = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'
  
  const facts: Array<{ name: string; value: string }> = [
    {
      name: 'Severity',
      value: alert.severity.toUpperCase()
    },
    {
      name: 'Current Value',
      value: alert.value.toFixed(2)
    }
  ]

  if (alert.metadata) {
    facts.push(
      {
        name: 'Metric',
        value: alert.metadata.metric
      },
      {
        name: 'Threshold',
        value: `${alert.metadata.condition} ${alert.metadata.threshold}`
      }
    )
  }

  facts.push({
    name: 'Timestamp',
    value: new Date(alert.timestamp).toLocaleString()
  })

  return {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: `VoiceWatch AI Alert: ${alert.ruleName}`,
    themeColor: getSeverityColor(alert.severity),
    title: `${emoji} ${alert.ruleName}`,
    sections: [
      {
        activityTitle: 'VoiceWatch AI Alert',
        activitySubtitle: alert.message,
        facts
      }
    ]
  }
}

export async function sendWebhook(webhook: WebhookConfig, alert: Alert): Promise<boolean> {
  if (!webhook.enabled) {
    return false
  }

  if (!webhook.severityFilter.includes(alert.severity)) {
    return false
  }

  const startTime = Date.now()
  let success = false
  let statusCode: number | undefined
  let error: string | undefined

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
    } else if (webhook.provider === 'teams') {
      payload = formatTeamsPayload(alert)
    } else {
      return false
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    success = response.ok
    statusCode = response.status

    if (!success) {
      try {
        const errorBody = await response.text()
        error = `HTTP ${response.status}: ${errorBody.substring(0, 100)}`
      } catch {
        error = `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (err) {
    console.error(`Webhook delivery failed for ${webhook.name}:`, err)
    success = false
    error = err instanceof Error ? err.message : 'Unknown error'
  }

  await trackWebhookDelivery({
    webhookId: webhook.id,
    webhookName: webhook.name,
    alertId: alert.id,
    alertMessage: alert.message,
    severity: alert.severity,
    timestamp: startTime,
    success,
    statusCode,
    error
  })

  return success
}

async function trackWebhookDelivery(delivery: {
  webhookId: string
  webhookName: string
  alertId: string
  alertMessage: string
  severity: 'info' | 'warning' | 'critical'
  timestamp: number
  success: boolean
  statusCode?: number
  error?: string
}) {
  try {
    const deliveries = await window.spark.kv.get<any[]>('webhook-deliveries') || []
    const updatedDeliveries = [...deliveries, delivery].slice(-100)
    await window.spark.kv.set('webhook-deliveries', updatedDeliveries)
  } catch (error) {
    console.error('Failed to track webhook delivery:', error)
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
