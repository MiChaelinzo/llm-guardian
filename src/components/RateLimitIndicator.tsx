import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Lightning, Check, Warning } from '@phosphor-icons/react'
import { getRateLimiterStatus } from '@/lib/rate-limiter'

export function RateLimitIndicator() {
  const [status, setStatus] = useState<{ waitTime: number; cacheSize: number }>({
    waitTime: 0,
    cacheSize: 0
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getRateLimiterStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const isThrottled = status.waitTime > 0

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`gap-1.5 cursor-help ${
              isThrottled ? 'border-warning/50 bg-warning/10' : 'border-success/50 bg-success/10'
            }`}
          >
            {isThrottled ? (
              <>
                <Warning size={12} weight="fill" className="text-warning" />
                <span className="text-warning">Rate Limited</span>
              </>
            ) : (
              <>
                <Check size={12} weight="fill" className="text-success" />
                <span className="text-success">API Ready</span>
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            {isThrottled ? (
              <p>Rate limit active. Wait {Math.ceil(status.waitTime / 1000)}s</p>
            ) : (
              <p>AI features available</p>
            )}
            <p className="text-muted-foreground">
              <Lightning size={12} className="inline" /> {status.cacheSize} responses cached
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
