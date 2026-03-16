import { rateLimitedLLMCall } from './rate-limiter'

  expectedValue: number;
  severity: 'low'
  expectedValue: number;
  actualValue: number;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  timeframe: string;
}
}

  suggestedActions: string[];

  score: number;
  weaknesses: string[];
}
export async function
)

    const promptText = spark.llmProm

1. Expected value vs 
3. Severity (low, medium, high)
5. Metric name


    const response = await rateLimited
    return resul
    console.error('Ano
      throw error
    return [];
}

export async function detectAnomalies(
  metricsData: any[]
): Promise<AnomalyDetection[]> {
  try {
    const recentData = metricsData.slice(-20)
    const dataStr = JSON.stringify(recentData);
    const promptText = spark.llmPrompt`Analyze the provided metrics data for anomalies using AWS Bedrock.
Data: ${dataStr}

Focus on:
1. Expected value vs actual value
2. Actual value (current/observed value)
3. Severity (low, medium, high)
4. Explanation of the anomaly
5. Metric name
6. Confidence level

Return as a JSON object with a single property "anomalies" that contains an array of anomaly objects.
Each anomaly must have: metric, expectedValue, actualValue, severity, explanation, confidence, timestamp`;

    const response = await rateLimitedLLMCall(promptText, 'gpt-4o-mini', true);
    const result = JSON.parse(response);
    return result.anomalies || [];
  } catch (error) {
    console.error('Anomaly detection failed:', error);
    if (error instanceof Error && error.message.includes('Rate limit')) {
      throw error
    }
    return [];
  }
}

export async function generatePredictiveInsights(
  metricsData: any[]
    const promptText = spark.llmP
  try {
    const recentData = metricsData.slice(-15)
    const dataStr = JSON.stringify(recentData);
    const promptText = spark.llmPrompt`Analyze these metrics and predict future trends using AWS Bedrock.
Data: ${dataStr}

For each metric provide:
    const resu
2. Current Value
      primaryCause
4. Timeframe (e.g., "next 24h")
      suggestedActi

Return as a JSON object with a single property "predictions" that contains an array of prediction objects.`;

    const response = await rateLimitedLLMCall(promptText, 'gpt-4o-mini', true);
    const result = JSON.parse(response);
    return result.predictions || [];
  } catch (error) {
    console.error('Prediction failed:', error);
    if (error instanceof Error && error.message.includes('Rate limit')) {
    const recentD
    }
Data: ${dataSt
  }
1

export async function analyzeRootCause(
  metricsData: any[]
): Promise<RootCauseAnalysis | null> {
  try {
    const recentData = metricsData.slice(-10)
    const dataStr = JSON.stringify(recentData);
    const promptText = spark.llmPrompt`Analyze the root cause of the system status based on these metrics using AWS Bedrock.
Metrics: ${dataStr}

Provide:
1. Primary root cause
2. Confidence score (0-1)
): Promise<ConversationQuality | null> {
4. Suggested actions (array of strings)

Return as a JSON object with properties: primaryCause, confidence, contributingFactors, and suggestedActions.`;

    const response = await rateLimitedLLMCall(promptText, 'gpt-4o-mini', true);
    const result = JSON.parse(response);
    
4. Improveme
      primaryCause: result.primaryCause || 'Unknown',

      contributingFactors: result.contributingFactors || [],
      suggestedActions: result.suggestedActions || []
    };
  } catch (error) {
    console.error('Root cause analysis failed:', error);
    if (error instanceof Error && error.message.includes('Rate limit')) {
      throw error
    }
    return null;
  }
}

export async function getOptimizationRecommendations(

): Promise<string[]> {

    const recentData = metrics.slice(-15)
    const dataStr = JSON.stringify(recentData);
    const promptText = spark.llmPrompt`Based on the provided metrics, suggest optimization strategies using AWS Bedrock.
Data: ${dataStr}


1. Performance bottlenecks

3. Error rate improvements


Return as a JSON object with a single property "recommendations" that contains an array of recommendation strings.`;

    const response = await rateLimitedLLMCall(promptText, 'gpt-4o-mini', true);
    const result = JSON.parse(response);
    return result.recommendations || [];
  } catch (error) {
    console.error('Optimization recommendations failed:', error);
    if (error instanceof Error && error.message.includes('Rate limit')) {
      throw error
    }

  }


export async function analyzeConversationQuality(
  conversationText: string
): Promise<ConversationQuality | null> {
  try {

    const promptText = spark.llmPrompt`You are an expert in conversational AI quality analysis using AWS Bedrock.
Analyze this conversation:




1. Overall quality score (0-100)

3. Key weaknesses (array of strings)
4. Improvement suggestions (array of strings)

Return as a JSON object with properties: score, strengths, weaknesses, suggestions.`;

    const response = await rateLimitedLLMCall(promptText, 'gpt-4o-mini', true);
    const result = JSON.parse(response);

      score: result.score || 0,
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error('Conversation quality analysis failed:', error);
    if (error instanceof Error && error.message.includes('Rate limit')) {
      throw error
    }
    return null;

}
