// Ensure the global window interface is typed if you are using window.spark
declare global {
  interface Window {
    spark: {
      llm: (prompt: string, model: string, json: boolean) => Promise<string>;
    };
  }
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface LLMCacheEntry {
  timestamp: number;
  data: string;
}

class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    // Filter out requests older than the window
    this.requests = this.requests.filter(time => now - time < this.config.windowMs);

    if (this.requests.length >= this.config.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getWaitTime(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.config.windowMs);

    if (this.requests.length < this.config.maxRequests) {
      return 0;
    }

    const oldestRequest = this.requests[0];
    return this.config.windowMs - (now - oldestRequest);
  }

  reset(): void {
    this.requests = [];
  }
}

// Initialize the rate limiter (e.g., 20 requests per minute)
const llmRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20
});

// Initialize cache
const cache = new Map<string, LLMCacheEntry>();

export async function queryLLM(prompt: string, jsonMode: boolean = false): Promise<string> {
  const cacheKey = JSON.stringify({ prompt, jsonMode });
  const cached = cache.get(cacheKey);

  // 1. Check Cache
  if (cached) {
    // Optional: Add cache expiration logic here if needed (e.g., 1 hour)
    if (Date.now() - cached.timestamp < 1000 * 60 * 60) {
      return cached.data;
    }
    cache.delete(cacheKey);
  }

  // 2. Check Rate Limit
  const canProceed = await llmRateLimiter.checkLimit();
  if (!canProceed) {
    const waitTime = llmRateLimiter.getWaitTime();
    throw new Error(`Rate limit reached. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }

  // 3. Perform Request
  try {
    // Assuming 'gpt-4o' is the default model based on previous context
    const result = await window.spark.llm(prompt, 'gpt-4o', jsonMode);

    // 4. Update Cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: result,
    });

    // Simple LRU-like eviction: if cache grows too big, delete the first item
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    return result;

  } catch (error: any) {
    // specific handling for 429 errors often returned by AI APIs
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('Rate limit'))) {
      throw new Error('API rate limit reached. Please try again in a minute.');
    }
    console.error("LLM Call failed", error);
    throw error;
  }
}

export function clearLLMCache(): void {
  cache.clear();
}

export function getRateLimiterStatus() {
  return {
    waitTime: llmRateLimiter.getWaitTime(),
    cacheSize: cache.size,
    isRateLimited: llmRateLimiter.getWaitTime() > 0
  };
}
