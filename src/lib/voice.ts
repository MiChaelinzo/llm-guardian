import type { MetricSummary, Alert } from './types'

export interface VoiceResponse {
  text: string
  action?: 'show_metrics' | 'show_alerts' | 'acknowledge_alert' | 'create_rule'
  data?: unknown
}

export async function processVoiceQuery(
  query: string,
  summary: MetricSummary,
  alerts: Alert[]
): Promise<VoiceResponse> {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('health') || lowerQuery.includes('status') || lowerQuery.includes('how')) {
    const activeAlerts = alerts.filter(a => !a.acknowledged)
    const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length
    const warningCount = activeAlerts.filter(a => a.severity === 'warning').length
    
    if (criticalCount > 0) {
      return {
        text: `Critical! You have ${criticalCount} critical alert${criticalCount > 1 ? 's' : ''} and ${warningCount} warning${warningCount > 1 ? 's' : ''}. Average latency is ${Math.round(summary.avgLatency)} milliseconds with a ${summary.errorRate.toFixed(1)}% error rate.`,
        action: 'show_alerts'
      }
    } else if (warningCount > 0) {
      return {
        text: `System has ${warningCount} warning${warningCount > 1 ? 's' : ''}. Average latency is ${Math.round(summary.avgLatency)} milliseconds. Error rate is ${summary.errorRate.toFixed(1)}%.`,
        action: 'show_alerts'
      }
    } else {
      return {
        text: `All systems operational. Average latency is ${Math.round(summary.avgLatency)} milliseconds. ${summary.totalRequests} requests processed with ${summary.errorRate.toFixed(1)}% error rate.`,
        action: 'show_metrics'
      }
    }
  }
  
  if (lowerQuery.includes('latency')) {
    return {
      text: `Current latency metrics: Average ${Math.round(summary.avgLatency)} milliseconds, P95 is ${Math.round(summary.p95Latency)} milliseconds, and P99 is ${Math.round(summary.p99Latency)} milliseconds.`,
      action: 'show_metrics'
    }
  }
  
  if (lowerQuery.includes('error') || lowerQuery.includes('fail')) {
    return {
      text: `Error rate is ${summary.errorRate.toFixed(2)}% across ${summary.totalRequests} requests. ${alerts.filter(a => a.severity === 'critical').length} critical issues detected.`,
      action: 'show_alerts'
    }
  }
  
  if (lowerQuery.includes('cost') || lowerQuery.includes('spend')) {
    return {
      text: `Total spend is $${summary.totalCost.toFixed(4)} across ${summary.totalRequests} requests. That's approximately ${(summary.totalCost * 1000 / summary.totalRequests).toFixed(4)} dollars per request.`,
      action: 'show_metrics'
    }
  }
  
  if (lowerQuery.includes('alert') || lowerQuery.includes('issue') || lowerQuery.includes('problem')) {
    const activeAlerts = alerts.filter(a => !a.acknowledged)
    if (activeAlerts.length === 0) {
      return {
        text: 'No active alerts at this time. All detection rules are monitoring normally.',
        action: 'show_alerts'
      }
    }
    
    const latest = activeAlerts[activeAlerts.length - 1]
    return {
      text: `Latest alert: ${latest.message}. Severity: ${latest.severity}. Would you like me to acknowledge this alert?`,
      action: 'show_alerts',
      data: { alertId: latest.id }
    }
  }
  
  if (lowerQuery.includes('token')) {
    const avgTokens = summary.totalRequests > 0 ? summary.totalTokens / summary.totalRequests : 0
    return {
      text: `Total tokens processed: ${summary.totalTokens.toLocaleString()}. Average ${Math.round(avgTokens)} tokens per request.`,
      action: 'show_metrics'
    }
  }
  
  if (lowerQuery.includes('help') || lowerQuery.includes('what can')) {
    return {
      text: 'I can help you monitor your LLM application. Ask me about system health, latency, errors, costs, or alerts. I can also acknowledge alerts and help you investigate issues.',
      action: 'show_metrics'
    }
  }
  
  return {
    text: `I heard: "${query}". I can help you check system health, latency, errors, costs, or alerts. What would you like to know?`,
    action: 'show_metrics'
  }
}

export async function generateIncidentSuggestion(alert: Alert): Promise<string> {
  const promptText = `You are an AI operations assistant analyzing an LLM application alert.

Alert Details:
- Rule: ${alert.ruleName}
- Message: ${alert.message}
- Severity: ${alert.severity}
- Metric Value: ${alert.value}

Provide a concise 2-3 sentence recommendation for an AI engineer to resolve this issue. Focus on actionable steps.`

  try {
    const suggestion = await window.spark.llm(promptText, 'gpt-4o-mini')
    return suggestion
  } catch (error) {
    return 'Unable to generate AI suggestion at this time. Please review the alert details and check system logs.'
  }
}

export async function generateAIInsights(summary: MetricSummary, alerts: Alert[]): Promise<string[]> {
  const promptText = `You are an AI observability assistant analyzing LLM application metrics powered by Google Cloud Gemini.

Current Metrics:
- Average Latency: ${Math.round(summary.avgLatency)}ms
- P99 Latency: ${Math.round(summary.p99Latency)}ms
- Error Rate: ${summary.errorRate.toFixed(2)}%
- Total Requests: ${summary.totalRequests}
- Total Cost: $${summary.totalCost.toFixed(4)}
- Active Alerts: ${alerts.filter(a => !a.acknowledged).length}

Generate exactly 3 concise, actionable insights (each 1 sentence) about system health, trends, or recommendations. Return as JSON with an "insights" array property containing 3 strings.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    const parsed = JSON.parse(response)
    
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 3)
    }
    if (parsed.insights && Array.isArray(parsed.insights)) {
      return parsed.insights.slice(0, 3)
    }
    
    return [
      'System performance is stable with normal latency patterns.',
      `Processing ${summary.totalRequests} requests with ${summary.errorRate.toFixed(1)}% error rate.`,
      'No immediate optimization recommendations at this time.'
    ]
  } catch (error) {
    return [
      'System performance is stable with normal latency patterns.',
      `Processing ${summary.totalRequests} requests with ${summary.errorRate.toFixed(1)}% error rate.`,
      'No immediate optimization recommendations at this time.'
    ]
  }
}