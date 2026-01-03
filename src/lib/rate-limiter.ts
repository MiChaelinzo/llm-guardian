declare global {
  interface Window {
    spark: {
      llm: (prompt: string, model: string, json: boolean) => Promise<string>;
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      user: () => Promise<{
        avatarUrl: string;
        email: string;
        id: string;
        isOwner: boolean;
        login: string;
      }>;
      kv: {
        keys: () => Promise<string[]>;
        get: <T>(key: string) => Promise<T | undefined>;
        set: <T>(key: string, value: T) => Promise<void>;
        delete: (key: string) => Promise<void>;
      };
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

const llmRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 5
});

const cache = new Map<string, LLMCacheEntry>();

export async function rateLimitedLLMCall(prompt: string, model: string = 'gpt-4o', jsonMode: boolean = false): Promise<string> {
  const cacheKey = JSON.stringify({ prompt, model, jsonMode });
  const cached = cache.get(cacheKey);

  if (cached) {
    if (Date.now() - cached.timestamp < 1000 * 60 * 60) {
      return cached.data;
    }
    cache.delete(cacheKey);
  }

  const canProceed = await llmRateLimiter.checkLimit();
  if (!canProceed) {
    const waitTime = llmRateLimiter.getWaitTime();
    throw new Error(`Rate limit reached. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }

  try {
    const result = await window.spark.llm(prompt, model, jsonMode);

    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: result,
    });

    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    return result;

  } catch (error: any) {
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('Rate limit'))) {
      throw new Error('API rate limit reached. Please try again in a minute.');
    }
    console.error("LLM Call failed", error);
    throw error;
  }
}

export async function queryLLM(prompt: string, jsonMode: boolean = false): Promise<string> {
  return rateLimitedLLMCall(prompt, 'gpt-4o', jsonMode);
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
