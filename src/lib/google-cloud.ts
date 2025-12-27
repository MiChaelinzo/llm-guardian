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
  qualityScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}

export async function detectAnomalies(
  metrics: Array<{ timestamp: number; [key: string]: number }>,
  metricNames: string[]
): Promise<AnomalyDetection[]> {
  const promptText = `You are an expert in anomaly detection for LLM systems.

Analyze the following metrics data and detect anomalies:
${JSON.stringify(metrics.slice(-20))}

Metric names to analyze: ${metricNames.join(', ')}

For each detected anomaly, provide:
1. Metric name
2. Expected value
3. Actual value
4. Severity (low, medium, high)
5. Confidence level (0-1)
6. Explanation

Return as a JSON object with a single property "anomalies" that contains an array of anomaly objects.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
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
  const promptText = `You are an expert in predictive analytics for LLM systems.

Based on the following historical metrics data:
${JSON.stringify(metrics.slice(-20))}

Predict future values for these metrics: ${metricNames.join(', ')}

For each metric, provide:
1. Current value
2. Predicted value (next 15 minutes)
3. Confidence level (0-1)

Return as a JSON object with a single property "predictions" that contains an array of prediction objects.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    return result.predictions || []
  } catch (error) {
    console.error('Metric prediction failed:', error)
    return []
  }
}

export async function analyzeRootCause(
  metrics: Array<{ timestamp: number; [key: string]: number }>,
  recentAlerts: Array<{ message: string; timestamp: number; severity: string }>
): Promise<RootCauseAnalysis | null> {
  const metricsData = JSON.stringify(metrics.slice(-20))
  const alertsData = JSON.stringify(recentAlerts.slice(-10))
  
  const promptText = `You are an expert in root cause analysis for LLM systems.

Recent metrics:
${metricsData}

Recent alerts:
${alertsData}

Analyze and provide:
1. Primary root cause
2. Confidence level (0-1)
3. Quality score (0-100)
4. Contributing factors (array)
5. Suggested actions (array)

Return as a JSON object with properties: primaryCause, confidence, qualityScore, contributingFactors, suggestedActions.`

  try {
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
  const promptText = `You are an expert in LLM system optimization.

Based on these metrics:
${JSON.stringify(metrics.slice(-20))}

Provide specific optimization recommendations for:
1. Cost reduction
2. Latency improvements
3. Token usage optimization
4. Model selection guidance
5. Caching strategies

Return as a JSON object with a single property "recommendations" that contains an array of recommendation strings.`

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
  conversationData: Array<{ role: string; content: string; timestamp: number }>
): Promise<ConversationQuality | null> {
  const promptText = `You are an expert in conversational AI quality assessment.

Analyze this conversation:
${JSON.stringify(conversationData)}

Provide:
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
