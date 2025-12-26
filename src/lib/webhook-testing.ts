import type { Alert, WebhookConfig, RuleSeverity } from './types'

interface TestResult {
  success: boolean
  statusCode?: number
  responseTime: number
  error?: string
  payload?: any
  timestamp: number
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
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

function validateWebhookUrl(webhook: WebhookConfig): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const url = new URL(webhook.url)

    if (url.protocol !== 'https:') {
      errors.push('Webhook URL must use HTTPS protocol')
    }

    switch (webhook.provider) {
      case 'slack':
        if (!url.hostname.includes('slack.com')) {
          warnings.push('URL does not appear to be a Slack webhook')
        }
        if (!url.pathname.includes('/services/')) {
          errors.push('Invalid Slack webhook URL format')
        }
        break
      
      case 'teams':
        if (!url.hostname.includes('office.com') && !url.hostname.includes('office365.com')) {
          warnings.push('URL does not appear to be a Microsoft Teams webhook')
        }
        break
      
      case 'pagerduty':
        if (!url.hostname.includes('pagerduty.com')) {
          warnings.push('URL does not appear to be a PagerDuty webhook')
        }
        break
    }

  } catch (error) {
    errors.push('Invalid URL format')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

function createTestAlert(severity: RuleSeverity): Alert {
  const severityMap: Record<RuleSeverity, { rule: string; message: string; value: number }> = {
    info: {
      rule: 'Information Test',
      message: 'This is an informational test alert from VoiceWatch AI webhook testing',
      value: 50
    },
    warning: {
      rule: 'Warning Test',
      message: 'This is a warning test alert from VoiceWatch AI webhook testing',
      value: 1500
    },
    critical: {
      rule: 'Critical Test',
      message: 'This is a critical test alert from VoiceWatch AI webhook testing',
      value: 5000
    }
  }

  const config = severityMap[severity]

  return {
    id: `test_alert_${Date.now()}`,
    ruleId: 'webhook_test_rule',
    ruleName: config.rule,
    message: config.message,
    severity,
    timestamp: Date.now(),
    value: config.value,
    metadata: {
      metric: 'avgLatency',
      threshold: 1000,
      condition: 'gt'
    },
    acknowledged: false
  }
}

function formatSlackPayload(alert: Alert) {
  const emoji = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'
  
  return {
    text: `*VoiceWatch AI Test Alert*: ${alert.ruleName}`,
    attachments: [
      {
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
          },
          {
            title: 'Metric',
            value: alert.metadata?.metric || 'N/A',
            short: true
          },
          {
            title: 'Threshold',
            value: alert.metadata ? `${alert.metadata.condition} ${alert.metadata.threshold}` : 'N/A',
            short: true
          }
        ],
        footer: 'VoiceWatch AI - Integration Test',
        ts: Math.floor(alert.timestamp / 1000)
      }
    ]
  }
}

function formatPagerDutyPayload(alert: Alert, routingKey: string) {
  return {
    routing_key: routingKey || 'webhook-test',
    event_action: 'trigger',
    payload: {
      summary: `${alert.ruleName}: ${alert.message}`,
      severity: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info',
      source: 'VoiceWatch AI - Integration Test',
      timestamp: new Date(alert.timestamp).toISOString(),
      custom_details: {
        alert_id: alert.id,
        rule_id: alert.ruleId,
        rule_name: alert.ruleName,
        current_value: alert.value,
        metric: alert.metadata?.metric,
        threshold: alert.metadata?.threshold,
        condition: alert.metadata?.condition,
        test_mode: true
      }
    }
  }
}

function formatTeamsPayload(alert: Alert) {
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
    summary: `VoiceWatch AI Test Alert: ${alert.ruleName}`,
    themeColor: getSeverityColor(alert.severity),
    title: `${emoji} ${alert.ruleName}`,
    sections: [
      {
        activityTitle: 'VoiceWatch AI Integration Test',
        activitySubtitle: alert.message,
        facts,
        text: '**This is a test alert to verify webhook connectivity**'
      }
    ]
  }
}

export async function testWebhookWithDetails(
  webhook: WebhookConfig,
  severity: RuleSeverity = 'info'
): Promise<TestResult> {
  const startTime = performance.now()

  const validation = validateWebhookUrl(webhook)
  if (!validation.valid) {
    return {
      success: false,
      responseTime: 0,
      error: validation.errors.join(', '),
      timestamp: Date.now()
    }
  }

  if (!webhook.severityFilter.includes(severity)) {
    return {
      success: false,
      responseTime: 0,
      error: `Webhook is not configured to receive ${severity} alerts`,
      timestamp: Date.now()
    }
  }

  const alert = createTestAlert(severity)
  let payload: any
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  try {
    switch (webhook.provider) {
      case 'slack':
        payload = formatSlackPayload(alert)
        break
      
      case 'pagerduty':
        const routingKey = new URL(webhook.url).searchParams.get('routing_key') || 'test-key'
        payload = formatPagerDutyPayload(alert, routingKey)
        break
      
      case 'teams':
        payload = formatTeamsPayload(alert)
        break
      
      default:
        return {
          success: false,
          responseTime: 0,
          error: `Unsupported provider: ${webhook.provider}`,
          timestamp: Date.now()
        }
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    })

    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    if (response.ok) {
      return {
        success: true,
        statusCode: response.status,
        responseTime,
        payload,
        timestamp: Date.now()
      }
    } else {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorBody = await response.text()
        if (errorBody) {
          errorMessage += ` - ${errorBody.substring(0, 100)}`
        }
      } catch {
        // Ignore error reading response body
      }

      return {
        success: false,
        statusCode: response.status,
        responseTime,
        error: errorMessage,
        timestamp: Date.now()
      }
    }
  } catch (error) {
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    let errorMessage = 'Unknown error'
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        errorMessage = 'Request timeout (10s)'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to reach endpoint (CORS or network issue)'
      } else {
        errorMessage = error.message
      }
    }

    return {
      success: false,
      responseTime,
      error: errorMessage,
      timestamp: Date.now()
    }
  }
}

export async function validateWebhookConfig(webhook: WebhookConfig): Promise<{
  valid: boolean
  issues: string[]
}> {
  const issues: string[] = []

  if (!webhook.name || webhook.name.trim().length === 0) {
    issues.push('Webhook name is required')
  }

  if (!webhook.url || webhook.url.trim().length === 0) {
    issues.push('Webhook URL is required')
  } else {
    const validation = validateWebhookUrl(webhook)
    issues.push(...validation.errors, ...validation.warnings)
  }

  if (!webhook.severityFilter || webhook.severityFilter.length === 0) {
    issues.push('At least one severity filter must be selected')
  }

  if (webhook.enabled && issues.length > 0) {
    issues.push('Webhook is enabled but has configuration issues')
  }

  const urlValidation = validateWebhookUrl(webhook)

  return {
    valid: issues.length === 0 || issues.every(i => !urlValidation.errors.includes(i)),
    issues
  }
}
