interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

class RateLimiter {
  private requests: number[] = []
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.config.windowMs)
    
    if (this.requests.length >= this.config.maxRequests) {
      return false
    }
    
    this.requests.push(now)
    return true
  }

  getWaitTime(): number {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.config.windowMs)
    
    if (this.requests.length < this.config.maxRequests) {
      return 0
    }
    
    const oldestRequest = this.requests[0]
    return this.config.windowMs - (now - oldestRequest)
  }

  reset(): void {
    this.requests = []
  }
}

const llmRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000
})

interface CacheEntry {
  data: string
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000

export async function rateLimitedLLMCall(
  prompt: string,
  modelName: string = 'gpt-4o-mini',
  jsonMode: boolean = false
): Promise<string> {
  const cacheKey = `${prompt}-${modelName}-${jsonMode}`
  const cached = cache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const canProceed = await llmRateLimiter.checkLimit()
  
  if (!canProceed) {
    const waitTime = llmRateLimiter.getWaitTime()
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`)
  }

  try {
    const result = await window.spark.llm(prompt, modelName, jsonMode)
    
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })
    
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value
      if (oldestKey) cache.delete(oldestKey)
    }
    
    return result
  } catch (error) {
    if (error instanceof Error && error.message.includes('429')) {
      throw new Error('API rate limit reached. Please try again in a minute.')
    }
    throw error
  }
}

export function clearLLMCache(): void {
  cache.clear()
}

export function getRateLimiterStatus() {
  return {
    waitTime: llmRateLimiter.getWaitTime(),
    cacheSize: cache.size
  }
}
