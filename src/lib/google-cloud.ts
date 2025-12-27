export interface AnomalyDetection {
  metric: string
  expectedValue: number
  actualValue: number
  severity: 'low' | 'medium' | 'high'
  confidence: number
  explanation: string
  timestamp: number
}

export interface PredictiveInsight {
  metric: string
  currentValue: number
  predictedValue: number
  timeframe: string
  confidence: number
}

export interface RootCauseAnalysis {
  primaryCause: string
  confidence: number
  qualityScore: number
  contributingFactors: string[]
  suggestedActions: string[]
}

export interface ConversationQuality {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}

export async function detectAnomalies(
  metrics: Array<{ timestamp: number; [key: string]: number }>,
  metricNames?: string[]
): Promise<AnomalyDetection[]> {
  try {
    const metricsData = JSON.stringify(metrics.slice(-50))
    const focusMetrics = metricNames && metricNames.length > 0 
      ? `Focus specifically on these metrics: ${metricNames.join(', ')}`
      : 'Analyze all available metrics'
    
    const promptText = `You are an AI expert in telemetry analysis and anomaly detection.
Analyze the following metrics data and detect any anomalies:

${metricsData}

${focusMetrics}

For each detected anomaly, provide:
1. Expected value
2. Actual value
3. Severity (low, medium, high)
4. Confidence (0-1)
5. Explanation
6. Timestamp
7. Metric name (which metric has the anomaly)

Return as a JSON object with a single property "anomalies" that contains an array of anomaly objects.`

    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const result = JSON.parse(response)
    return result.anomalies || []
  } catch (error) {
    console.error('Anomaly detection failed:', error)
    return []
  }
}

export async function predictMetrics(
  metrics: Array<{ timestamp: number; [key: string]: number }>,
  metricNames: string[]
): Promise<PredictiveInsight[]> {
  try {
    const metricsData = JSON.stringify(metrics.slice(-100))
    
    const promptText = `You are an AI expert in time series forecasting.
Based on the following historical metrics, predict future values for the next hour:

Metrics: ${metricNames.join(', ')}
Data: ${metricsData}

For each metric, provide:
1. Current value
2. Predicted value (1 hour ahead)
3. Confidence (0-1)
4. Timeframe

Return as a JSON object with a single property "predictions" that contains an array of prediction objects.`

    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const result = JSON.parse(response)
    return result.predictions || []
  } catch (error) {
    console.error('Prediction failed:', error)
    return []
  }
}

export async function analyzeRootCause(
  metrics: Array<{ timestamp: number; [key: string]: number }>,
  recentAlerts: Array<{ message: string; timestamp: number }>
): Promise<RootCauseAnalysis | null> {
  try {
    const metricsData = JSON.stringify(metrics.slice(-20))
    const alertsData = JSON.stringify(recentAlerts)
    
    const promptText = `You are an AI expert in system reliability and root cause analysis.
Analyze the following metrics and alerts to determine the root cause:

Metrics: ${metricsData}
Recent Alerts: ${alertsData}

Provide:
1. Primary root cause
2. Confidence (0-1)
3. Quality score (0-100)
4. Contributing factors (array)
5. Suggested actions (array)

Return as a JSON object with properties: primaryCause, confidence, qualityScore, contributingFactors, suggestedActions.`

    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const result = JSON.parse(response)
    return {
      primaryCause: result.primaryCause || 'Unknown',
      confidence: result.confidence || 0,
      qualityScore: result.qualityScore || 0,
      contributingFactors: result.contributingFactors || [],
      suggestedActions: result.suggestedActions || []
    }
  } catch (error) {
    console.error('Root cause analysis failed:', error)
    return null
  }
}

export async function getOptimizationRecommendations(
  metrics: Array<{ timestamp: number; [key: string]: number }>
): Promise<string[]> {
  try {
    const metricsData = JSON.stringify(metrics.slice(-20))
    
    const promptText = `You are an AI expert in LLM optimization and cost reduction.
Based on the following metrics, provide actionable optimization recommendations:

${metricsData}

Focus on:
1. Cost reduction strategies
2. Latency optimization
3. Error rate improvements
4. Model selection guidance

Return as a JSON object with a single property "recommendations" that contains an array of recommendation strings.`

    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const result = JSON.parse(response)
    return result.recommendations || []
  } catch (error) {
    console.error('Optimization recommendations failed:', error)
    return []
  }
}

export async function analyzeConversationQuality(
  conversationText: string
): Promise<ConversationQuality | null> {
  try {
    const promptText = `You are an expert in conversational AI quality analysis.
Analyze this conversation:

${conversationText}

Provide:
1. Overall quality score (0-100)
2. Key strengths (array of strings)
3. Key weaknesses (array of strings)
4. Improvement suggestions (array of strings)

Return as a JSON object with properties: score, strengths, weaknesses, suggestions.`

    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const result = JSON.parse(response)
    return {
      score: result.score || 0,
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      suggestions: result.suggestions || []
    }
  } catch (error) {
    console.error('Conversation quality analysis failed:', error)
    return null
  }
}
