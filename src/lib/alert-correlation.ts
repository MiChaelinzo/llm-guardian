import type { Alert, Incident, CorrelationGroup, CorrelationFactor, CorrelationRule, RuleSeverity } from './types'

export class AlertCorrelationEngine {
  private correlationRules: CorrelationRule[]
  private correlationGroups: Map<string, CorrelationGroup>

  constructor(rules: CorrelationRule[] = []) {
    this.correlationRules = rules.length > 0 ? rules : this.getDefaultRules()
    this.correlationGroups = new Map()
  }

  private getDefaultRules(): CorrelationRule[] {
    return [
      {
        id: 'default-temporal',
        name: 'Temporal Correlation',
        enabled: true,
        timeWindowMs: 5 * 60 * 1000,
        minAlerts: 2,
        scoreThreshold: 0.6,
        autoCreateIncident: true,
        groupBySeverity: true,
        groupByMetric: true,
        createdAt: Date.now(),
      },
    ]
  }

  analyzeAlerts(alerts: Alert[], existingIncidents: Incident[]): {
    correlationGroups: CorrelationGroup[]
    suggestedIncidents: Partial<Incident>[]
  } {
    const now = Date.now()
    const activeRule = this.correlationRules.find(r => r.enabled)
    
    if (!activeRule) {
      return { correlationGroups: [], suggestedIncidents: [] }
    }

    const recentAlerts = alerts.filter(
      a => now - a.timestamp < activeRule.timeWindowMs && !a.acknowledged
    )

    if (recentAlerts.length < activeRule.minAlerts) {
      return { correlationGroups: [], suggestedIncidents: [] }
    }

    const groups = this.groupAlertsByCorrelation(recentAlerts, activeRule, existingIncidents)
    
    const suggestedIncidents = groups
      .filter(g => g.correlationScore >= activeRule.scoreThreshold && activeRule.autoCreateIncident)
      .map(g => this.createIncidentFromGroup(g))

    return {
      correlationGroups: groups,
      suggestedIncidents,
    }
  }

  private groupAlertsByCorrelation(
    alerts: Alert[],
    rule: CorrelationRule,
    existingIncidents: Incident[]
  ): CorrelationGroup[] {
    const groups: CorrelationGroup[] = []
    const processedAlerts = new Set<string>()

    const existingIncidentAlertIds = new Set(
      existingIncidents.flatMap(inc => inc.alerts.map(a => a.id))
    )

    for (let i = 0; i < alerts.length; i++) {
      const alertA = alerts[i]
      
      if (processedAlerts.has(alertA.id) || existingIncidentAlertIds.has(alertA.id)) {
        continue
      }

      const correlatedAlerts: Alert[] = [alertA]
      processedAlerts.add(alertA.id)

      for (let j = i + 1; j < alerts.length; j++) {
        const alertB = alerts[j]
        
        if (processedAlerts.has(alertB.id) || existingIncidentAlertIds.has(alertB.id)) {
          continue
        }

        const { score, factors } = this.calculateCorrelationScore(alertA, alertB, rule)
        
        if (score >= rule.scoreThreshold) {
          correlatedAlerts.push(alertB)
          processedAlerts.add(alertB.id)
        }
      }

      if (correlatedAlerts.length >= rule.minAlerts) {
        const group = this.createCorrelationGroup(correlatedAlerts, rule)
        groups.push(group)
      }
    }

    return groups
  }

  private calculateCorrelationScore(
    alertA: Alert,
    alertB: Alert,
    rule: CorrelationRule
  ): { score: number; factors: CorrelationFactor[] } {
    const factors: CorrelationFactor[] = []
    let totalScore = 0
    let factorCount = 0

    const timeDiffMs = Math.abs(alertA.timestamp - alertB.timestamp)
    const temporalScore = Math.max(0, 1 - (timeDiffMs / rule.timeWindowMs))
    if (temporalScore > 0.3) {
      factors.push({
        type: 'temporal',
        score: temporalScore,
        description: `Alerts occurred within ${Math.floor(timeDiffMs / 1000)}s of each other`,
      })
      totalScore += temporalScore
      factorCount++
    }

    if (rule.groupByMetric && alertA.metadata.metric === alertB.metadata.metric) {
      const metricScore = 0.8
      factors.push({
        type: 'metric',
        score: metricScore,
        description: `Both alerts monitor the same metric: ${alertA.metadata.metric}`,
      })
      totalScore += metricScore
      factorCount++
    }

    if (rule.groupBySeverity && alertA.severity === alertB.severity) {
      const severityScore = 0.6
      factors.push({
        type: 'severity',
        score: severityScore,
        description: `Both alerts have ${alertA.severity} severity`,
      })
      totalScore += severityScore
      factorCount++
    }

    if (alertA.ruleId === alertB.ruleId) {
      const patternScore = 0.9
      factors.push({
        type: 'pattern',
        score: patternScore,
        description: 'Same detection rule triggered multiple times',
      })
      totalScore += patternScore
      factorCount++
    }

    const avgScore = factorCount > 0 ? totalScore / factorCount : 0

    return { score: avgScore, factors }
  }

  private createCorrelationGroup(alerts: Alert[], rule: CorrelationRule): CorrelationGroup {
    const severity = this.determineGroupSeverity(alerts)
    const metric = alerts[0].metadata.metric
    const { score, factors } = this.calculateGroupScore(alerts, rule)

    const groupId = `correlation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      id: groupId,
      name: this.generateGroupName(alerts),
      description: this.generateGroupDescription(alerts, factors),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      severity,
      status: 'active',
      incidentIds: [],
      alertIds: alerts.map(a => a.id),
      rootCause: this.suggestRootCause(alerts, factors),
      correlationScore: score,
      correlationFactors: factors,
    }
  }

  private calculateGroupScore(alerts: Alert[], rule: CorrelationRule): {
    score: number
    factors: CorrelationFactor[]
  } {
    if (alerts.length < 2) {
      return { score: 0, factors: [] }
    }

    const allFactors: CorrelationFactor[] = []
    let totalScore = 0
    let pairCount = 0

    for (let i = 0; i < alerts.length - 1; i++) {
      const { score, factors } = this.calculateCorrelationScore(alerts[i], alerts[i + 1], rule)
      allFactors.push(...factors)
      totalScore += score
      pairCount++
    }

    const avgScore = pairCount > 0 ? totalScore / pairCount : 0

    const uniqueFactors = this.deduplicateFactors(allFactors)

    return { score: avgScore, factors: uniqueFactors }
  }

  private deduplicateFactors(factors: CorrelationFactor[]): CorrelationFactor[] {
    const seen = new Map<string, CorrelationFactor>()
    
    factors.forEach(factor => {
      const key = `${factor.type}-${factor.description}`
      const existing = seen.get(key)
      
      if (!existing || factor.score > existing.score) {
        seen.set(key, factor)
      }
    })

    return Array.from(seen.values())
  }

  private determineGroupSeverity(alerts: Alert[]): RuleSeverity {
    const hasCritical = alerts.some(a => a.severity === 'critical')
    if (hasCritical) return 'critical'

    const hasWarning = alerts.some(a => a.severity === 'warning')
    if (hasWarning) return 'warning'

    return 'info'
  }

  private generateGroupName(alerts: Alert[]): string {
    const metric = alerts[0].metadata.metric
    const uniqueRules = new Set(alerts.map(a => a.ruleName))
    
    if (uniqueRules.size === 1) {
      return `${alerts[0].ruleName} (${alerts.length} occurrences)`
    }

    const metricNames: Record<string, string> = {
      avgLatency: 'Latency',
      p95Latency: 'P95 Latency',
      p99Latency: 'P99 Latency',
      errorRate: 'Error Rate',
      cost: 'Cost',
      tokens: 'Token Usage',
      requests: 'Request Volume',
    }

    return `${metricNames[metric] || metric} Issues (${alerts.length} alerts)`
  }

  private generateGroupDescription(alerts: Alert[], factors: CorrelationFactor[]): string {
    const timeSpan = Math.max(...alerts.map(a => a.timestamp)) - Math.min(...alerts.map(a => a.timestamp))
    const timeSpanSec = Math.floor(timeSpan / 1000)

    const factorDescriptions = factors.map(f => f.description).join('; ')

    return `${alerts.length} correlated alerts detected over ${timeSpanSec}s. ${factorDescriptions}`
  }

  private suggestRootCause(alerts: Alert[], factors: CorrelationFactor[]): string {
    const metric = alerts[0].metadata.metric
    const severity = this.determineGroupSeverity(alerts)
    const repeatedRule = alerts.every(a => a.ruleId === alerts[0].ruleId)

    if (repeatedRule && metric === 'errorRate') {
      return 'Persistent error pattern - possible service degradation or deployment issue'
    }

    if (repeatedRule && (metric === 'avgLatency' || metric === 'p95Latency' || metric === 'p99Latency')) {
      return 'Consistent latency degradation - possible resource contention or downstream service issue'
    }

    if (metric === 'cost') {
      return 'Unexpected cost spike - review token usage and model selection'
    }

    const hasTemporalFactor = factors.some(f => f.type === 'temporal' && f.score > 0.7)
    if (hasTemporalFactor && severity === 'critical') {
      return 'Cascading failure pattern detected - investigate root service dependencies'
    }

    if (factors.some(f => f.type === 'pattern')) {
      return 'Recurring issue pattern - systematic problem requiring investigation'
    }

    return 'Multiple correlated alerts - potential systemic issue requiring investigation'
  }

  private createIncidentFromGroup(group: CorrelationGroup): Partial<Incident> {
    return {
      title: group.name,
      description: `${group.description}\n\nSuggested root cause: ${group.rootCause}`,
      severity: group.severity,
      status: 'open',
      correlationGroupId: group.id,
    }
  }

  updateRules(rules: CorrelationRule[]): void {
    this.correlationRules = rules
  }

  getCorrelationGroups(): CorrelationGroup[] {
    return Array.from(this.correlationGroups.values())
  }

  clearCorrelationGroups(): void {
    this.correlationGroups.clear()
  }
}

export function createDefaultCorrelationRules(): CorrelationRule[] {
  return [
    {
      id: 'rule-temporal-strict',
      name: 'Strict Temporal Correlation',
      enabled: true,
      timeWindowMs: 2 * 60 * 1000,
      minAlerts: 3,
      scoreThreshold: 0.75,
      autoCreateIncident: true,
      groupBySeverity: true,
      groupByMetric: true,
      createdAt: Date.now(),
    },
    {
      id: 'rule-temporal-relaxed',
      name: 'Relaxed Temporal Correlation',
      enabled: false,
      timeWindowMs: 10 * 60 * 1000,
      minAlerts: 2,
      scoreThreshold: 0.5,
      autoCreateIncident: false,
      groupBySeverity: false,
      groupByMetric: true,
      createdAt: Date.now(),
    },
    {
      id: 'rule-pattern-matching',
      name: 'Pattern-Based Correlation',
      enabled: false,
      timeWindowMs: 15 * 60 * 1000,
      minAlerts: 4,
      scoreThreshold: 0.7,
      autoCreateIncident: true,
      groupBySeverity: true,
      groupByMetric: false,
      createdAt: Date.now(),
    },
  ]
}
