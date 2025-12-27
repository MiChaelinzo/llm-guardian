declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
    }
  }
}

const spark = window.spark

export interface VertexAIConfig {
  projectId: string
}

export interface AnomalyDetection {
  metric: string
  timestamp: number
  actualValue: number
  expectedValue: number
  severity: 'low' | 'medium' | 'high'
  confidence: number
  explanation: string
}

export interface PredictiveInsight {
  metric: string
  prediction: number
  confidence: number
  timeframe: string
}

export interface RootCauseAnalysis {
  issue: string
  primaryCause: string
  contributingFactors: string[]
  suggestedActions: string[]
  confidence: number
}

export async function detectAnomaliesWithVertexAI(
  metrics: Array<{ timestamp: number; [key: string]: number }>,
  metricName: string
): Promise<AnomalyDetection[]> {
  const prompt = spark.llmPrompt`You are an expert in LLM observability and anomaly detection. 

Analyze the following time-series metric data for "${metricName}":
${JSON.stringify(metrics.map(m => ({ timestamp: m.timestamp, value: m[metricName] })), null, 2)}

Identify any anomalies, outliers, or unusual patterns. For each anomaly found, provide:
1. The timestamp of the anomaly
2. The actual value
3. What the expected value should be
4. Severity (low/medium/high)
5. Confidence score (0-1)
6. A brief explanation

Return as a JSON object with a single property "anomalies" containing an array of anomaly objects.`

  try {
    const response = await spark.llm(prompt, 'gpt-4o-mini', true)
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
  const prompt = spark.llmPrompt`You are an expert in predictive analytics for LLM systems.

Analyze these metrics and predict future trends:
${JSON.stringify(metrics.slice(-20), null, 2)}

Metrics to analyze: ${metricNames.join(', ')}

For each metric, predict:
1. The expected value in the next 5 minutes
2. Confidence level (0-1)
3. The timeframe for this prediction

Return as a JSON object with a single property "predictions" containing an array of prediction objects.`

  try {
    const response = await spark.llm(prompt, 'gpt-4o-mini', true)
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
  const prompt = spark.llmPrompt`You are an expert in LLM system diagnostics and root cause analysis.

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
    const response = await spark.llm(prompt, 'gpt-4o', true)
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
  const recentMetrics = metrics.slice(-30)
  const avgLatency = recentMetrics.reduce((sum, m) => sum + (m.avgLatency || 0), 0) / recentMetrics.length
  const avgCost = recentMetrics.reduce((sum, m) => sum + (m.cost || 0), 0) / recentMetrics.length
  const avgTokens = recentMetrics.reduce((sum, m) => sum + (m.totalTokens || 0), 0) / recentMetrics.length
  const errorRate = recentMetrics.reduce((sum, m) => sum + (m.errorRate || 0), 0) / recentMetrics.length

  const prompt = spark.llmPrompt`You are an expert in optimizing LLM applications for cost, performance, and reliability.

Current system metrics:
- Average Latency: ${avgLatency.toFixed(0)}ms
- Average Cost per Request: $${avgCost.toFixed(4)}
- Average Tokens per Request: ${avgTokens.toFixed(0)}
- Error Rate: ${errorRate.toFixed(2)}%

Provide 3-5 specific, actionable optimization recommendations to improve this system.
Consider: prompt optimization, caching strategies, model selection, rate limiting, error handling.

Return as a JSON object with a single property "recommendations" containing an array of string recommendations.`

  try {
    const response = await spark.llm(prompt, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    return result.recommendations || []
  } catch (error) {
    console.error('Optimization recommendations failed:', error)
    return []
  }
}

export async function analyzeConversationQuality(
  conversationSample: Array<{ role: string; content: string; latency: number; tokens: number }>
): Promise<{
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}> {
  const prompt = spark.llmPrompt`You are an expert in evaluating LLM conversation quality and user experience.

Analyze this conversation sample:
${JSON.stringify(conversationSample, null, 2)}

Evaluate and provide:
1. Overall quality score (0-100)
2. Strengths (array of 2-3 positive aspects)
3. Weaknesses (array of 2-3 areas for improvement)
4. Specific suggestions (array of 3-4 actionable improvements)

Return as a JSON object with properties: overallScore, strengths, weaknesses, suggestions.`

  try {
    const response = await spark.llm(prompt, 'gpt-4o', true)
    const result = JSON.parse(response)
    return {
      overallScore: result.overallScore || 0,
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      suggestions: result.suggestions || []
    }
  } catch (error) {
    console.error('Conversation quality analysis failed:', error)
    return {
      overallScore: 0,
      strengths: [],
      weaknesses: [],
      suggestions: []
    }
  }
}
