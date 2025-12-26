import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, Clock, Flask, Warning, Info } from '@phosphor-icons/react'
import type { WebhookConfig, RuleSeverity } from '@/lib/types'
import { testWebhookWithDetails } from '@/lib/webhook-testing'

interface WebhookTesterProps {
  webhook: WebhookConfig
}

interface TestResult {
  success: boolean
  statusCode?: number
  responseTime: number
  error?: string
  payload?: any
  timestamp: number
}

export function WebhookTester({ webhook }: WebhookTesterProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isTesting, setIsTesting] = useState(false)
  const [testSeverity, setTestSeverity] = useState<RuleSeverity>('warning')
  const [progress, setProgress] = useState(0)

  const runSingleTest = async () => {
    setIsTesting(true)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const result = await testWebhookWithDetails(webhook, testSeverity)
      
      clearInterval(progressInterval)
      setProgress(100)

      setTestResults((prev) => [result, ...prev].slice(0, 10))
    } catch (error) {
      const errorResult: TestResult = {
        success: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
      setTestResults((prev) => [errorResult, ...prev].slice(0, 10))
    } finally {
      setIsTesting(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const runBurstTest = async () => {
    setIsTesting(true)
    setProgress(0)
    const burstSize = 5
    const results: TestResult[] = []

    for (let i = 0; i < burstSize; i++) {
      setProgress(((i + 1) / burstSize) * 100)
      
      try {
        const result = await testWebhookWithDetails(webhook, testSeverity)
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        })
      }

      if (i < burstSize - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    setTestResults((prev) => [...results, ...prev].slice(0, 10))
    setIsTesting(false)
    setTimeout(() => setProgress(0), 1000)
  }

  const calculateStats = () => {
    if (testResults.length === 0) return null

    const successCount = testResults.filter(r => r.success).length
    const successRate = (successCount / testResults.length) * 100
    const avgResponseTime = testResults
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.responseTime, 0) / (successCount || 1)

    return {
      total: testResults.length,
      successCount,
      failCount: testResults.length - successCount,
      successRate,
      avgResponseTime
    }
  }

  const stats = calculateStats()

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flask size={24} weight="bold" className="text-primary" />
              Webhook Integration Testing
            </CardTitle>
            <CardDescription className="mt-1">
              Test real endpoint connectivity and reliability
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Test Severity</label>
              <Select value={testSeverity} onValueChange={(v) => setTestSeverity(v as RuleSeverity)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 self-end">
              <Button
                onClick={runSingleTest}
                disabled={isTesting}
                variant="outline"
              >
                <Flask size={18} weight="bold" />
                Single Test
              </Button>
              <Button
                onClick={runBurstTest}
                disabled={isTesting}
              >
                <Flask size={18} weight="bold" />
                Burst Test (5x)
              </Button>
            </div>
          </div>

          {isTesting && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Testing webhook endpoint...
              </p>
            </div>
          )}
        </div>

        {stats && (
          <>
            <Separator />
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Tests</div>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{stats.successCount}</div>
                <div className="text-xs text-muted-foreground">Successful</div>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded-lg">
                <div className="text-2xl font-bold text-destructive">{stats.failCount}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.successRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center p-3 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold text-accent">{stats.avgResponseTime.toFixed(0)}ms</div>
                <div className="text-xs text-muted-foreground">Avg Response</div>
              </div>
            </div>

            <Separator />
          </>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Clock size={16} weight="bold" />
            Test History
          </h4>

          {testResults.length === 0 ? (
            <Alert>
              <Info size={18} />
              <AlertDescription>
                No tests run yet. Click the test buttons above to validate your webhook endpoint.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={`${result.timestamp}-${index}`}
                  className={`flex items-start justify-between p-3 rounded-lg border ${
                    result.success
                      ? 'bg-success/5 border-success/20'
                      : 'bg-destructive/5 border-destructive/20'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {result.success ? (
                      <CheckCircle size={20} weight="fill" className="text-success mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle size={20} weight="fill" className="text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                        {result.statusCode && (
                          <Badge variant="outline" className="text-xs">
                            {result.statusCode}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {result.responseTime}ms
                        </span>
                      </div>
                      
                      {result.error && (
                        <p className="text-xs text-destructive break-words">
                          {result.error}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {testResults.some(r => !r.success) && (
          <Alert className="border-warning">
            <Warning size={18} />
            <AlertDescription>
              Some tests failed. Check your webhook URL, ensure the endpoint is accessible, and verify your credentials are correct.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
