export interface AnomalyDetection {
  metric: string
  timestamp: number
  actualValue: number
  expectedValue: number
  deviation: number
  severity: 'low' | 'medium' | 'high'
  explanation: string
  confidence: number
}

export interface PredictiveInsight {
  metric: string
  prediction: string
  predictedValue: number
  confidence: number
  timeframe: string
  severity: 'low' | 'medium' | 'high'
  explanation: string
}

export interface RootCauseAnalysis {
  issue: string
  primaryCause: string
  contributingFactors: string[]
  suggestedActions: string[]
  confidence: number
}

export interface ConversationQuality {
  qualityScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}

export async function detectAnomalies(
  metrics: Array<{ timestamp: number; [key: string]: number }>,
  metricNames: string[]
): Promise<AnomalyDetection[]> {
  const promptText = `You are an expert in predictive analytics for LLM systems.

Analyze the following metrics for anomalies:
${JSON.stringify(metrics.slice(-50), null, 2)}

Metric names to analyze: ${metricNames.join(', ')}

For each anomaly detected, provide:
1. The metric name
2. The timestamp
3. The actual value
4. The expected value based on historical patterns
5. The deviation percentage
6. Severity (low/medium/high)
7. Brief explanation
8. Confidence score (0-1)

Return as a JSON object with a single property "anomalies" containing an array of anomaly objects with properties: metric, timestamp, actualValue, expectedValue, deviation, severity, explanation, confidence.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    return result.anomalies || []
  } catch (error) {
    console.error('Anomaly detection failed:', error)
    return []
  }
}

export async function generatePredictiveInsights(
  metrics: Array<{ timestamp: number; [key: string]: number }>,
  metricNames: string[]
): Promise<PredictiveInsight[]> {
  const promptText = `You are an expert in predictive analytics for LLM systems.

Analyze the following historical metrics and predict future trends:
${JSON.stringify(metrics.slice(-100), null, 2)}

Metric names: ${metricNames.join(', ')}

For each metric, predict:
1. The expected value in the next 5 minutes
2. Confidence level (0-1)
3. The timeframe for this prediction
4. Severity level if concerning (low/medium/high)
5. Brief explanation

Return as a JSON object with a single property "predictions" containing an array of prediction objects with properties: metric, predictedValue, confidence, timeframe, severity, explanation.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    return result.predictions || []
  } catch (error) {
    console.error('Predictive insights failed:', error)
    return []
  }
}

export async function performRootCauseAnalysis(
  issue: string,
  recentMetrics: Array<{ timestamp: number; [key: string]: number }>,
  recentAlerts: Array<{ message: string; timestamp: number; severity: string }>
): Promise<RootCauseAnalysis | null> {
  const promptText = `You are an expert in LLM system diagnostics and root cause analysis.

Issue reported: "${issue}"

Recent metrics:
${JSON.stringify(recentMetrics.slice(-10), null, 2)}

Recent alerts:
${JSON.stringify(recentAlerts.slice(-5), null, 2)}

Perform a root cause analysis and provide:
1. Primary cause (string)
2. Contributing factors (array of strings)
3. Suggested actions to resolve (array of strings)
4. Confidence score (0-1)

Return as a JSON object with properties: primaryCause, contributingFactors, suggestedActions, confidence.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const result = JSON.parse(response)
    return {
      issue,
      primaryCause: result.primaryCause || 'Unknown',
      contributingFactors: result.contributingFactors || [],
      suggestedActions: result.suggestedActions || [],
      confidence: result.confidence || 0
    }
  } catch (error) {
    console.error('Root cause analysis failed:', error)
    return null
  }
}

export async function generateOptimizationRecommendations(
  metrics: Array<{ timestamp: number; [key: string]: number }>
): Promise<string[]> {
  const totalRequests = metrics.length
  const avgLatency = metrics.reduce((sum, m) => sum + (m.avgLatency || 0), 0) / totalRequests
  const avgTokens = metrics.reduce((sum, m) => sum + (m.totalTokens || 0), 0) / totalRequests
  const avgCost = metrics.reduce((sum, m) => sum + (m.totalCost || 0), 0) / totalRequests

  const promptText = `You are an expert in LLM system optimization and cost management.

System Performance Summary:
- Total Requests: ${totalRequests}
- Average Latency: ${avgLatency.toFixed(2)}ms
- Average Tokens: ${avgTokens.toFixed(0)}
- Average Cost: $${avgCost.toFixed(4)}

Analyze this performance data and provide 5-7 specific, actionable optimization recommendations.
Focus on:
1. Cost reduction strategies
2. Latency improvements
3. Token usage optimization
4. Model selection recommendations
5. Caching opportunities

Return as a JSON object with a single property "recommendations" containing an array of recommendation strings.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    return result.recommendations || []
  } catch (error) {
    console.error('Optimization recommendations failed:', error)
    return []
  }
}

export async function analyzeConversationQuality(
  conversationSample: string
): Promise<ConversationQuality | null> {
  const promptText = `You are an expert in conversational AI quality assessment.

Analyze the following LLM conversation sample:
${conversationSample}

Evaluate and provide:
1. Overall quality score (0-100)
2. Key strengths (array of strings)
3. Key weaknesses (array of strings)
4. Improvement suggestions (array of strings)

Return as a JSON object with properties: qualityScore, strengths, weaknesses, suggestions.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const result = JSON.parse(response)
    return {
      qualityScore: result.qualityScore || 0,
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      suggestions: result.suggestions || []
    }
  } catch (error) {
    console.error('Conversation quality analysis failed:', error)
    return null
  }
}
