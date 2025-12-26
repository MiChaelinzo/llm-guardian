import type { TelemetryMetric } from './types'

export class TelemetrySimulator {
  private intervalId: NodeJS.Timeout | null = null
  private metrics: TelemetryMetric[] = []
  private callback: (metric: TelemetryMetric) => void
  
  constructor(callback: (metric: TelemetryMetric) => void) {
    this.callback = callback
  }
  
  start() {
    let requestCount = 0
    
    this.intervalId = setInterval(() => {
      requestCount++
      
      const scenarios = [
        { weight: 70, type: 'normal' },
        { weight: 15, type: 'slow' },
        { weight: 10, type: 'error' },
        { weight: 5, type: 'spike' }
      ]
      
      const random = Math.random() * 100
      let cumulative = 0
      let scenario = 'normal'
      
      for (const s of scenarios) {
        cumulative += s.weight
        if (random < cumulative) {
          scenario = s.type
          break
        }
      }
      
      this.generateMetrics(scenario, requestCount)
    }, 2000 + Math.random() * 1000)
  }
  
  private generateMetrics(scenario: string, requestCount: number) {
    const timestamp = Date.now()
    const models = ['gemini-1.5-pro', 'gemini-1.5-flash', 'claude-3-5-sonnet']
    const model = models[Math.floor(Math.random() * models.length)]
    
    let latency: number
    let hasError = false
    let errorType: string | undefined
    let statusCode = 200
    
    switch (scenario) {
      case 'slow':
        latency = 3000 + Math.random() * 2000
        break
      case 'error':
        latency = 1000 + Math.random() * 500
        hasError = true
        const errors = ['rate_limit', 'timeout', 'invalid_request', 'server_error']
        errorType = errors[Math.floor(Math.random() * errors.length)]
        statusCode = errorType === 'rate_limit' ? 429 : errorType === 'timeout' ? 504 : 500
        break
      case 'spike':
        latency = 5000 + Math.random() * 3000
        break
      default:
        latency = 500 + Math.random() * 1500
    }
    
    const tokens = hasError ? 0 : Math.floor(200 + Math.random() * 800)
    const cost = hasError ? 0 : (tokens / 1000) * 0.00125
    
    const baseMetadata = {
      model,
      endpoint: '/v1/chat/completions',
      statusCode,
      userId: `user_${Math.floor(Math.random() * 100)}`
    }
    
    const requestMetric: TelemetryMetric = {
      id: `req_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      type: 'request',
      value: 1,
      metadata: baseMetadata
    }
    
    const latencyMetric: TelemetryMetric = {
      id: `lat_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      type: 'latency',
      value: latency,
      metadata: baseMetadata
    }
    
    this.callback(requestMetric)
    this.callback(latencyMetric)
    
    if (hasError) {
      const errorMetric: TelemetryMetric = {
        id: `err_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        type: 'error',
        value: 1,
        metadata: { ...baseMetadata, errorType }
      }
      this.callback(errorMetric)
    } else {
      const tokenMetric: TelemetryMetric = {
        id: `tok_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        type: 'tokens',
        value: tokens,
        metadata: baseMetadata
      }
      
      const costMetric: TelemetryMetric = {
        id: `cost_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        type: 'cost',
        value: cost,
        metadata: baseMetadata
      }
      
      this.callback(tokenMetric)
      this.callback(costMetric)
    }
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
