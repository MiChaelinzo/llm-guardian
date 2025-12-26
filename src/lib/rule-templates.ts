import type { DetectionRule } from './types'

export interface RuleTemplate {
  id: string
  category: 'sla' | 'cost' | 'performance' | 'reliability'
  name: string
  description: string
  rule: Omit<DetectionRule, 'id'>
}

export const ruleTemplates: RuleTemplate[] = [
  {
    id: 'sla-p95-violation',
    category: 'sla',
    name: 'SLA: P95 Latency Violation',
    description: 'Alert when P95 latency exceeds SLA threshold of 2 seconds',
    rule: {
      name: 'P95 Latency SLA Violation',
      description: 'Triggers when P95 latency exceeds 2000ms, violating performance SLA',
      metric: 'p95Latency',
      condition: 'gt',
      threshold: 2000,
      severity: 'critical',
      enabled: true,
      actions: ['alert', 'incident', 'notify']
    }
  },
  {
    id: 'sla-p99-violation',
    category: 'sla',
    name: 'SLA: P99 Latency Violation',
    description: 'Alert when P99 latency exceeds 5 seconds',
    rule: {
      name: 'P99 Latency SLA Violation',
      description: 'Triggers when P99 latency exceeds 5000ms for worst-case scenarios',
      metric: 'p99Latency',
      condition: 'gt',
      threshold: 5000,
      severity: 'critical',
      enabled: true,
      actions: ['alert', 'incident', 'notify']
    }
  },
  {
    id: 'sla-error-rate',
    category: 'sla',
    name: 'SLA: Error Rate Threshold',
    description: 'Alert when error rate exceeds 5% of requests',
    rule: {
      name: 'Error Rate SLA Violation',
      description: 'Triggers when error rate exceeds 5%, indicating reliability issues',
      metric: 'errorRate',
      condition: 'gt',
      threshold: 5,
      severity: 'critical',
      enabled: true,
      actions: ['alert', 'incident', 'notify']
    }
  },
  {
    id: 'sla-availability',
    category: 'sla',
    name: 'SLA: Low Request Volume',
    description: 'Alert when request volume drops below expected minimum',
    rule: {
      name: 'Low Request Volume',
      description: 'Triggers when total requests fall below 100, potentially indicating service unavailability',
      metric: 'totalRequests',
      condition: 'lt',
      threshold: 100,
      severity: 'warning',
      enabled: true,
      actions: ['alert', 'notify']
    }
  },
  {
    id: 'cost-daily-budget',
    category: 'cost',
    name: 'Cost: Daily Budget Limit',
    description: 'Alert when daily costs exceed $50',
    rule: {
      name: 'Daily Budget Exceeded',
      description: 'Triggers when total cost exceeds $50 daily budget',
      metric: 'totalCost',
      condition: 'gt',
      threshold: 50,
      severity: 'warning',
      enabled: true,
      actions: ['alert', 'notify']
    }
  },
  {
    id: 'cost-critical-overrun',
    category: 'cost',
    name: 'Cost: Critical Overrun',
    description: 'Alert when costs exceed critical threshold of $100',
    rule: {
      name: 'Critical Cost Overrun',
      description: 'Triggers when total cost exceeds $100, requiring immediate action',
      metric: 'totalCost',
      condition: 'gt',
      threshold: 100,
      severity: 'critical',
      enabled: true,
      actions: ['alert', 'incident', 'notify']
    }
  },
  {
    id: 'cost-token-limit',
    category: 'cost',
    name: 'Cost: Token Usage Limit',
    description: 'Alert when token usage exceeds budget',
    rule: {
      name: 'Token Usage Budget Exceeded',
      description: 'Triggers when total tokens exceed 1 million, preventing cost overruns',
      metric: 'totalTokens',
      condition: 'gt',
      threshold: 1000000,
      severity: 'warning',
      enabled: true,
      actions: ['alert', 'notify']
    }
  },
  {
    id: 'cost-per-request-spike',
    category: 'cost',
    name: 'Cost: High Request Volume',
    description: 'Alert on unusually high request volume that may impact costs',
    rule: {
      name: 'High Request Volume Alert',
      description: 'Triggers when request volume exceeds 10,000, potentially causing cost spikes',
      metric: 'totalRequests',
      condition: 'gt',
      threshold: 10000,
      severity: 'warning',
      enabled: true,
      actions: ['alert', 'notify']
    }
  },
  {
    id: 'perf-avg-latency',
    category: 'performance',
    name: 'Performance: High Average Latency',
    description: 'Alert when average latency degrades beyond 500ms',
    rule: {
      name: 'High Average Latency',
      description: 'Triggers when average latency exceeds 500ms, indicating performance degradation',
      metric: 'avgLatency',
      condition: 'gt',
      threshold: 500,
      severity: 'warning',
      enabled: true,
      actions: ['alert', 'notify']
    }
  },
  {
    id: 'perf-critical-latency',
    category: 'performance',
    name: 'Performance: Critical Latency',
    description: 'Alert when average latency reaches critical level',
    rule: {
      name: 'Critical Average Latency',
      description: 'Triggers when average latency exceeds 1500ms, indicating severe performance issues',
      metric: 'avgLatency',
      condition: 'gt',
      threshold: 1500,
      severity: 'critical',
      enabled: true,
      actions: ['alert', 'incident', 'notify']
    }
  },
  {
    id: 'perf-p95-degradation',
    category: 'performance',
    name: 'Performance: P95 Degradation',
    description: 'Alert when P95 latency shows early degradation signs',
    rule: {
      name: 'P95 Performance Degradation',
      description: 'Triggers when P95 latency exceeds 1000ms, indicating performance degradation',
      metric: 'p95Latency',
      condition: 'gt',
      threshold: 1000,
      severity: 'warning',
      enabled: true,
      actions: ['alert', 'notify']
    }
  },
  {
    id: 'perf-p99-degradation',
    category: 'performance',
    name: 'Performance: P99 Tail Latency',
    description: 'Alert on P99 tail latency issues',
    rule: {
      name: 'P99 Tail Latency Alert',
      description: 'Triggers when P99 latency exceeds 3000ms for tail latency issues',
      metric: 'p99Latency',
      condition: 'gt',
      threshold: 3000,
      severity: 'warning',
      enabled: true,
      actions: ['alert', 'notify']
    }
  },
  {
    id: 'reliability-error-warning',
    category: 'reliability',
    name: 'Reliability: Elevated Error Rate',
    description: 'Alert when error rate shows early warning signs',
    rule: {
      name: 'Elevated Error Rate',
      description: 'Triggers when error rate exceeds 2%, indicating potential issues',
      metric: 'errorRate',
      condition: 'gt',
      threshold: 2,
      severity: 'warning',
      enabled: true,
      actions: ['alert', 'notify']
    }
  },
  {
    id: 'reliability-critical-errors',
    category: 'reliability',
    name: 'Reliability: Critical Error Rate',
    description: 'Alert when error rate reaches critical level',
    rule: {
      name: 'Critical Error Rate',
      description: 'Triggers when error rate exceeds 10%, indicating severe reliability issues',
      metric: 'errorRate',
      condition: 'gt',
      threshold: 10,
      severity: 'critical',
      enabled: true,
      actions: ['alert', 'incident', 'notify']
    }
  },
  {
    id: 'reliability-zero-errors',
    category: 'reliability',
    name: 'Reliability: Error-Free Baseline',
    description: 'Monitor when error rate deviates from zero',
    rule: {
      name: 'Error-Free Baseline Violation',
      description: 'Triggers when error rate exceeds 0.5%, deviating from error-free baseline',
      metric: 'errorRate',
      condition: 'gt',
      threshold: 0.5,
      severity: 'info',
      enabled: true,
      actions: ['alert']
    }
  }
]

export function getRuleTemplatesByCategory(category: RuleTemplate['category']): RuleTemplate[] {
  return ruleTemplates.filter(template => template.category === category)
}

export function getAllCategories(): Array<{ value: RuleTemplate['category']; label: string; description: string }> {
  return [
    {
      value: 'sla',
      label: 'SLA Violations',
      description: 'Monitor service level agreement compliance'
    },
    {
      value: 'cost',
      label: 'Cost Overruns',
      description: 'Prevent budget overruns and cost spikes'
    },
    {
      value: 'performance',
      label: 'Performance Degradation',
      description: 'Detect latency and throughput issues'
    },
    {
      value: 'reliability',
      label: 'Reliability Issues',
      description: 'Monitor error rates and availability'
    }
  ]
}
