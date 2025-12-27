interface RateLimitConfig {
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

  data: string
}


  prompt: stri
  jsonMode: boolean
 

    return cached.data


    const waitTime = llmRateLimiter.getWa
  }
  try {
    
      data: result,
    })
    if (cache.size > 100) {
  
    
  } catch (error) {
   

}
ex
}
export function getRateLimiterStatus() {
    waitTime: llmRateLimiter.getWaitTime(),
  }















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
