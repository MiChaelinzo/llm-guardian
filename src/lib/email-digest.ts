import type { 
  Incident, 
  Alert, 
  TelemetryMetric,
  MetricsSummary,
  EmailNotificationLog 
} from './types'

export type DigestFrequency = 'daily' | 'weekly'

export interface DigestConfig {
  email: string
  frequency: DigestFrequency
  enabled: boolean
  includeIncidents: boolean
  includeAlerts: boolean
  includeMetrics: boolean
  includeTrends: boolean
  sendTime: string // Format "HH:MM" (24h)
  lastSentAt?: number
}

export interface DigestData {
  period: {
    start: number
    end: number
    label: string
  }
  incidents: {
    total: number
    resolved: number
    open: number
    bySeverity: {
      critical: number
      warning: number
      info: number
    }
    list: Incident[]
  }
  alerts: {
    total: number
    acknowledged: number
    unacknowledged: number
    bySeverity: {
      critical: number
      warning: number
      info: number
    }
    list: Alert[]
  }
  metrics: {
    summary: MetricsSummary
    trends: {
      latency: 'up' | 'down' | 'stable'
      errorRate: 'up' | 'down' | 'stable'
      cost: 'up' | 'down' | 'stable'
    }
    topIssues: string[]
  }
}

export class EmailDigestService {
  
  private calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    const threshold = 0.05
    const change = previous > 0 ? (current - previous) / previous : 0
    
    if (change > threshold) return 'up'
    if (change < -threshold) return 'down'
    return 'stable'
  }

  private getPeriodRange(frequency: DigestFrequency): { start: number; end: number; label: string } {
    const now = Date.now()
    const msPerDay = 24 * 60 * 60 * 1000
    
    if (frequency === 'daily') {
      return {
        start: now - msPerDay,
        end: now,
        label: 'Past 24 Hours'
      }
    } else {
      return {
        start: now - 7 * msPerDay,
        end: now,
        label: 'Past 7 Days'
      }
    }
  }

  prepareDigestData(
    frequency: DigestFrequency,
    incidents: Incident[],
    alerts: Alert[],
    metrics: TelemetryMetric[],
    previousMetricsSummary?: MetricsSummary,
    currentMetricsSummary?: MetricsSummary
  ): DigestData {
    const period = this.getPeriodRange(frequency)
    
    const periodIncidents = incidents.filter(
      i => i.createdAt >= period.start && i.createdAt <= period.end
    )
    
    const periodAlerts = alerts.filter(
      a => a.timestamp >= period.start && a.timestamp <= period.end
    )

    const incidentsBySeverity = {
      critical: periodIncidents.filter(i => i.severity === 'critical').length,
      warning: periodIncidents.filter(i => i.severity === 'warning').length,
      info: periodIncidents.filter(i => i.severity === 'info').length
    }

    const alertsBySeverity = {
      critical: periodAlerts.filter(a => a.severity === 'critical').length,
      warning: periodAlerts.filter(a => a.severity === 'warning').length,
      info: periodAlerts.filter(a => a.severity === 'info').length
    }

    const trends = {
      latency: previousMetricsSummary && currentMetricsSummary 
        ? this.calculateTrend(currentMetricsSummary.avgLatency, previousMetricsSummary.avgLatency)
        : 'stable' as const,
      errorRate: previousMetricsSummary && currentMetricsSummary 
        ? this.calculateTrend(currentMetricsSummary.errorRate, previousMetricsSummary.errorRate)
        : 'stable' as const,
      cost: previousMetricsSummary && currentMetricsSummary 
        ? this.calculateTrend(currentMetricsSummary.totalCost, previousMetricsSummary.totalCost)
        : 'stable' as const
    }

    const topIssues: string[] = []
    if (incidentsBySeverity.critical > 0) {
      topIssues.push(`${incidentsBySeverity.critical} critical incident${incidentsBySeverity.critical > 1 ? 's' : ''}`)
    }
    if (trends.errorRate === 'up') {
      topIssues.push('Error rate increasing')
    }
    if (trends.latency === 'up') {
      topIssues.push('Latency trending upward')
    }
    if (trends.cost === 'up') {
      topIssues.push('Cost spike detected')
    }

    return {
      period,
      incidents: {
        total: periodIncidents.length,
        resolved: periodIncidents.filter(i => i.status === 'resolved').length,
        open: periodIncidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
        bySeverity: incidentsBySeverity,
        list: periodIncidents.slice(0, 10)
      },
      alerts: {
        total: periodAlerts.length,
        acknowledged: periodAlerts.filter(a => a.acknowledged).length,
        unacknowledged: periodAlerts.filter(a => !a.acknowledged).length,
        bySeverity: alertsBySeverity,
        list: periodAlerts.slice(0, 10)
      },
      metrics: {
        summary: currentMetricsSummary || {
          totalRequests: 0,
          errorRate: 0,
          avgLatency: 0,
          p95Latency: 0,
          p99Latency: 0,
          totalCost: 0,
          totalTokens: 0
        },
        trends,
        topIssues
      }
    }
  }

  private formatTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      case 'stable': return '➡️'
    }
  }

  async generateDigestEmail(
    config: DigestConfig,
    data: DigestData
  ): Promise<{ subject: string; body: string; html?: string }> {
    const { period, incidents, alerts, metrics } = data
    
    const subject = `📊 VoiceWatch AI ${config.frequency === 'daily' ? 'Daily' : 'Weekly'} Digest - ${period.label}`
    
    let body = `
VoiceWatch AI ${config.frequency === 'daily' ? 'Daily' : 'Weekly'} Digest
${period.label} (${new Date(period.start).toLocaleDateString()} - ${new Date(period.end).toLocaleDateString()})

═══════════════════════════════════════════════════════════════
`

    if (config.includeIncidents && incidents.total > 0) {
      body += `
📋 INCIDENTS SUMMARY
────────────────────────────────────────────────────────────────
Total Incidents: ${incidents.total}
  • Resolved: ${incidents.resolved}
  • Open: ${incidents.open}

By Severity:
  • Critical: ${incidents.bySeverity.critical}
  • Warning: ${incidents.bySeverity.warning}
  • Info: ${incidents.bySeverity.info}

Recent Incidents:
${incidents.list.map(i => `
  [${i.severity.toUpperCase()}] ${i.title}
  Status: ${i.status}
  Created: ${new Date(i.createdAt).toLocaleString()}
  ${i.resolvedAt ? `Resolved: ${new Date(i.resolvedAt).toLocaleString()}` : ''}
`).join('\n')}

`
    }

    if (config.includeAlerts && alerts.total > 0) {
      body += `
🔔 ALERTS SUMMARY
────────────────────────────────────────────────────────────────
Total Alerts: ${alerts.total}
  • Acknowledged: ${alerts.acknowledged}
  • Unacknowledged: ${alerts.unacknowledged}

By Severity:
  • Critical: ${alerts.bySeverity.critical}
  • Warning: ${alerts.bySeverity.warning}
  • Info: ${alerts.bySeverity.info}

Top Alerts:
${alerts.list.slice(0, 5).map(a => `
  [${a.severity.toUpperCase()}] ${a.ruleName}
  ${a.message}
  Value: ${a.value} | Time: ${new Date(a.timestamp).toLocaleString()}
`).join('\n')}

`
    }

    if (config.includeMetrics) {
      body += `
📊 PERFORMANCE METRICS
────────────────────────────────────────────────────────────────
Total Requests: ${metrics.summary.totalRequests.toLocaleString()}
Error Rate: ${metrics.summary.errorRate.toFixed(2)}%
Average Latency: ${metrics.summary.avgLatency.toFixed(0)}ms
P99 Latency: ${metrics.summary.p99Latency.toFixed(0)}ms
Total Cost: $${metrics.summary.totalCost.toFixed(2)}
Total Tokens: ${metrics.summary.totalTokens.toLocaleString()}

`
    }

    if (config.includeTrends) {
      body += `
📈 TRENDS
────────────────────────────────────────────────────────────────
${this.formatTrendIcon(metrics.trends.latency)} Latency: ${metrics.trends.latency}
${this.formatTrendIcon(metrics.trends.errorRate)} Error Rate: ${metrics.trends.errorRate}
${this.formatTrendIcon(metrics.trends.cost)} Cost: ${metrics.trends.cost}

${metrics.topIssues.length > 0 ? `
⚠️  Top Issues:
${metrics.topIssues.map(issue => `  • ${issue}`).join('\n')}
` : '✅ No significant issues detected'}

`
    }

    body += `
═══════════════════════════════════════════════════════════════

View full details in your VoiceWatch AI dashboard.

This is an automated digest from VoiceWatch AI.
To modify your digest preferences, visit the Settings page.
`

    let html: string | undefined

    try {
      if ((window as any).spark && (window as any).spark.llmPrompt && (window as any).spark.llm) {
        const prompt = (window as any).spark.llmPrompt`
You are an expert email designer. Create a beautiful, professional HTML email for this digest report.

Subject: ${subject}

Content:
${body}

Requirements:
1. Use a modern, clean design with proper spacing
2. Include visual elements like progress bars for metrics
3. Use color coding: Red for critical, Yellow/Orange for warning, Blue for info, Green for success
4. Make it responsive for mobile devices
5. Include clear sections with headers
6. Add icons/emojis where appropriate
7. Use tables for structured data
8. Return ONLY the complete HTML code with inline CSS
9. Use a professional color scheme suitable for business emails
`
        html = await (window as any).spark.llm(prompt, 'gpt-4o-mini', false)
      }
    } catch (err) {
      console.warn('Failed to generate HTML digest with LLM:', err)
    }

    return { subject, body, html }
  }

  async sendDigest(
    config: DigestConfig,
    data: DigestData
  ): Promise<EmailNotificationLog> {
    try {
      const { subject, body, html } = await this.generateDigestEmail(config, data)
      
      console.log(`[Email Digest] Sending ${config.frequency} digest to: ${config.email}`)
      console.log(`Subject: ${subject}`)
      console.log('Preview:', body.substring(0, 200) + '...')
      
      return {
        id: `digest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: config.email,
        subject,
        body,
        sentAt: Date.now(),
        status: 'sent'
      }
    } catch (error) {
      console.error('[Email Digest] Failed to send digest:', error)
      return {
        id: `digest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: config.email,
        subject: 'Digest Failed',
        body: '',
        sentAt: Date.now(),
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    }
  }

  shouldSendDigest(config: DigestConfig, currentTime: Date): boolean {
    if (!config.enabled) return false
    
    const [hours, minutes] = config.sendTime.split(':').map(Number)
    const currentHours = currentTime.getHours()
    const currentMinutes = currentTime.getMinutes()
    
    const isCorrectTime = currentHours === hours && currentMinutes === minutes
    
    if (!isCorrectTime) return false
    
    if (!config.lastSentAt) return true
    
    const msSinceLastSent = currentTime.getTime() - config.lastSentAt
    const msPerDay = 24 * 60 * 60 * 1000
    
    if (config.frequency === 'daily') {
      return msSinceLastSent >= msPerDay
    } else {
      return msSinceLastSent >= 7 * msPerDay
    }
  }
}

export const emailDigestService = new EmailDigestService()



