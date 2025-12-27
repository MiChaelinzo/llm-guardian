declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
}

export interface AnomalyDetection {
  metric: string
  actualValue: number
  expectedValue: number
  deviation: number
  severity: 'low' | 'medium' | 'high'
  explanation: string
  timestamp?: number
  confidence?: number
}

export interface PredictiveInsight {
  metric: string
  predictedValue: number
  prediction?: number
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
  const prompt = spark.llmPrompt`You are an expert in anomaly detection for LLM systems.

Analyze these metrics and detect anomalies:
${JSON.stringify(metrics.map(m => ({ timestamp: m.timestamp, values: metricNames.map(name => ({ [name]: m[name] })) })), null, 2)}

Identify any anomalies in the data. For each anomaly found, provide:
1. The metric name
2. The actual value
3. The expected value (based on historical patterns)
4. The deviation percentage
5. Severity (low/medium/high)
6. Brief explanation

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

Analyze these metrics and generate predictions:
${JSON.stringify(metrics.slice(-50), null, 2)}

For each metric, predict:
1. The expected value in the next 5 minutes
2. Confidence level (0-1)
3. The timeframe for this prediction
4. Severity level if concerning (low/medium/high)
5. Brief explanation

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
  const totalRequests = metrics.length
  const avgLatency = metrics.reduce((sum, m) => sum + (m.avgLatency || 0), 0) / totalRequests
  const avgTokens = metrics.reduce((sum, m) => sum + (m.totalTokens || 0), 0) / totalRequests
  const avgCost = metrics.reduce((sum, m) => sum + (m.totalCost || 0), 0) / totalRequests

  const prompt = spark.llmPrompt`You are an expert in LLM system optimization and cost management.

System Performance Summary:
- Total Requests: ${totalRequests}
- Average Latency: ${avgLatency.toFixed(2)}ms
- Average Tokens: ${avgTokens.toFixed(0)}
- Average Cost: $${avgCost.toFixed(4)}

Based on these metrics, provide 3-5 specific optimization recommendations to improve performance and reduce costs.
Return as a JSON object with a single property "recommendations" containing an array of recommendation strings.`

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
  conversationText: string
): Promise<ConversationQuality> {
  const prompt = spark.llmPrompt`You are an expert in conversational AI quality analysis.

Analyze this conversation and evaluate its quality:
"${conversationText}"

Provide:
1. Overall quality score (0-100)
2. Strengths (array of strings)
3. Weaknesses (array of strings)
4. Suggestions for improvement (array of strings)

Return as a JSON object with properties: qualityScore, strengths, weaknesses, suggestions.`

  try {
    const response = await spark.llm(prompt, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    return {
      qualityScore: result.qualityScore || 0,
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      suggestions: result.suggestions || []
    }
  } catch (error) {
    console.error('Conversation quality analysis failed:', error)
    return {
      qualityScore: 0,
      strengths: [],
      weaknesses: [],
      suggestions: []
    }
  }
}
