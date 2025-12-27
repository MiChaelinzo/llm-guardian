// If window.spark is not globally typed in your project, you might need this declaration.
// Otherwise, you can remove the declare global block.
declare global {
  interface Window {
    spark: {
      llm: (prompt: string, model: string, json: boolean) => Promise<string>;
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
    };
  }
}

const spark = window.spark;

export interface AnomalyDetection {
  metric: string;
  expectedValue: number;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  confidence: number;
  timestamp: number;
}

export interface PredictiveInsight {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
}

export interface RootCauseAnalysis {
  primaryCause: string;
  confidence: number;
  suggestedActions: string[];
}

export interface ConversationQuality {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export async function detectAnomalies(
  metricsData: any[]
): Promise<AnomalyDetection[]> {
  try {
    const promptText = spark.llmPrompt`Analyze the provided metrics data for anomalies.
Data: ${JSON.stringify(metricsData)}

Focus on:
1. Expected value vs actual value
2. Severity (low, medium, high)
3. Explanation of the anomaly
4. Metric name
5. Confidence level

Return as a JSON object with a single property "anomalies" that contains an array of anomaly objects.`;

    const response = await window.spark.llm(promptText, 'gpt-4o', true);
    const result = JSON.parse(response);
    return result.anomalies || [];
  } catch (error) {
    console.error('Anomaly detection failed:', error);
    return [];
  }
}

export async function generatePredictiveInsights(
  metricsData: any[]
): Promise<PredictiveInsight[]> {
  try {
    const promptText = spark.llmPrompt`Analyze these metrics and predict future trends.
Data: ${JSON.stringify(metricsData)}

For each metric provide:
1. Metric name
2. Current Value
3. Predicted Value
4. Timeframe (e.g., "next 24h")
5. Confidence score

Return as a JSON object with a single property "predictions" that contains an array of prediction objects.`;

    const response = await window.spark.llm(promptText, 'gpt-4o', true);
    const result = JSON.parse(response);
    return result.predictions || [];
  } catch (error) {
    console.error('Prediction failed:', error);
    return [];
  }
}

export async function analyzeRootCause(
  metricsData: any[]
): Promise<RootCauseAnalysis | null> {
  try {
    const promptText = spark.llmPrompt`Analyze the root cause of the system status based on these metrics.
Metrics: ${JSON.stringify(metricsData)}

Provide:
1. Primary root cause
2. Confidence score (0-1)
3. Suggested actions (array of strings)

Return as a JSON object with properties: primaryCause, confidence, and suggestedActions.`;

    const response = await window.spark.llm(promptText, 'gpt-4o', true);
    const result = JSON.parse(response);
    
    return {
      primaryCause: result.primaryCause || 'Unknown',
      confidence: result.confidence || 0,
      suggestedActions: result.suggestedActions || []
    };
  } catch (error) {
    console.error('Root cause analysis failed:', error);
    return null;
  }
}

export async function getOptimizationRecommendations(
  metrics: any[]
): Promise<string[]> {
  try {
    const promptText = spark.llmPrompt`Based on the provided metrics, suggest optimization strategies.
Data: ${JSON.stringify(metrics)}

Focus on:
1. Performance bottlenecks
2. Resource utilization
3. Error rate improvements
4. Model selection guidance

Return as a JSON object with a single property "recommendations" that contains an array of recommendation strings.`;

    const response = await window.spark.llm(promptText, 'gpt-4o', true);
    const result = JSON.parse(response);
    return result.recommendations || [];
  } catch (error) {
    console.error('Optimization recommendations failed:', error);
    return [];
  }
}

export async function analyzeConversationQuality(
  conversationText: string
): Promise<ConversationQuality | null> {
  try {
    const promptText = spark.llmPrompt`You are an expert in conversational AI quality analysis.
Analyze this conversation:

${conversationText}

Provide:
1. Overall quality score (0-100)
2. Key strengths (array of strings)
3. Key weaknesses (array of strings)
4. Improvement suggestions (array of strings)

Return as a JSON object with properties: score, strengths, weaknesses, suggestions.`;

    const response = await window.spark.llm(promptText, 'gpt-4o', true);
    const result = JSON.parse(response);
    return {
      score: result.score || 0,
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error('Conversation quality analysis failed:', error);
    return null;
  }
}
