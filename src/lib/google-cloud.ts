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
  predictedValue: number
  confidence: number
  timeframe: string
  severity: 'low' | 'medium' | 'high'
  explanation: string
}

export interface RootCauseAnalysis {
  issue: string
  qualityScore: number
  confidence: number
  primaryCause: string
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
  const metricsData = JSON.stringify(metrics.slice(-20))
  const metricList = metricNames.join(', ')
  
  const prompt = (window.spark.llmPrompt as any)`You are an expert in anomaly detection for LLM systems.

Analyze the following metrics data and detect anomalies:
${metricsData}

Metric names to analyze: ${metricList}

For each detected anomaly, provide:
1. Metric name
2. Expected value
3. Actual value
4. Severity (low, medium, high)
5. Confidence level (0-1)
6. Explanation
7. Timestamp

Return as a JSON object with a single property "anomalies" that contains an array of anomaly objects.`

  try {
    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
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
  const metricsData = JSON.stringify(metrics.slice(-20))
  const metricList = metricNames.join(', ')
  
  const prompt = (window.spark.llmPrompt as any)`You are an expert in predictive analytics for LLM systems.

Based on the following historical metrics data:
${metricsData}

For each metric (${metricList}), predict:
1. The expected value in the next 15 minutes
2. Confidence level (0-1)
3. Severity if prediction indicates issues
4. Explanation of the prediction

Return as a JSON object with a single property "predictions" that contains an array of prediction objects.`

  try {
    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    return result.predictions || []
  } catch (error) {
    console.error('Metric prediction failed:', error)
    return []
  }
}

export async function generatePredictiveInsights(
  metrics: Array<{ timestamp: number; [key: string]: number }>,
  metricNames: string[]
): Promise<PredictiveInsight[]> {
  return predictMetrics(metrics, metricNames)
}

export async function analyzeRootCause(
  issue: string,
  recentAlerts: Array<{ message: string; timestamp: number }>,
  metrics: Array<{ timestamp: number; [key: string]: number }>
): Promise<RootCauseAnalysis | null> {
  const alertsData = JSON.stringify(recentAlerts.slice(-10))
  const metricsData = JSON.stringify(metrics.slice(-10))
  
  const prompt = (window.spark.llmPrompt as any)`You are an expert in root cause analysis for LLM systems.

Issue: ${issue}

Recent alerts:
${alertsData}

Recent metrics:
${metricsData}

Analyze and provide:
1. Quality score (0-100)
2. Confidence level (0-1)
3. Primary root cause
4. Contributing factors (array)
5. Suggested actions (array)

Return as a JSON object with properties: qualityScore, confidence, primaryCause, contributingFactors, suggestedActions.`

  try {
    const response = await window.spark.llm(prompt, 'gpt-4o', true)
    const result = JSON.parse(response)
    return {
      issue,
      qualityScore: result.qualityScore || 0,
      confidence: result.confidence || 0,
      primaryCause: result.primaryCause || 'Unknown',
      contributingFactors: result.contributingFactors || [],
      suggestedActions: result.suggestedActions || []
    }
  } catch (error) {
    console.error('Root cause analysis failed:', error)
    return null
  }
}

export async function performRootCauseAnalysis(
  issue: string,
  metrics: Array<{ timestamp: number; [key: string]: number }>,
  recentAlerts: Array<{ message: string; timestamp: number; severity?: string }>
): Promise<RootCauseAnalysis | null> {
  return analyzeRootCause(issue, recentAlerts, metrics)
}

export async function generateOptimizationRecommendations(
  metrics: Array<{ timestamp: number; [key: string]: number }>
): Promise<string[]> {
  const avgLatency = metrics.reduce((sum, m) => sum + (m.avgLatency || 0), 0) / metrics.length
  const avgCost = metrics.reduce((sum, m) => sum + (m.cost || 0), 0) / metrics.length
  const avgTokens = metrics.reduce((sum, m) => sum + (m.totalTokens || 0), 0) / metrics.length

  const latencyStr = avgLatency.toFixed(2)
  const costStr = avgCost.toFixed(4)
  const tokensStr = avgTokens.toFixed(0)
  
  const prompt = (window.spark.llmPrompt as any)`You are an expert in LLM system optimization.

Current performance metrics:
- Average Latency: ${latencyStr}ms
- Average Cost: $${costStr}
- Average Tokens: ${tokensStr}

Analyze this performance data and provide specific recommendations for:
1. Cost reduction strategies
2. Latency optimization
3. Token usage optimization
4. Model selection improvements
5. Caching opportunities

Return as a JSON object with a single property "recommendations" that contains an array of recommendation strings.`

  try {
    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
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
  const prompt = (window.spark.llmPrompt as any)`You are an expert in conversational AI quality assessment.

Analyze the following LLM conversation sample:
${conversationSample}

Evaluate and provide:
1. Overall quality score (0-100)
2. Key strengths (array of strings)
3. Key weaknesses (array of strings)
4. Improvement suggestions (array of strings)

Return as a JSON object with properties: qualityScore, strengths, weaknesses, suggestions.`

  try {
    const response = await window.spark.llm(prompt, 'gpt-4o', true)
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
