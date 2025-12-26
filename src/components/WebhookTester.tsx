import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flask, CheckCircle, XCircle, Warning } from '@phosphor-icons/react'
import { testWebhookWithDetails } from '@/lib/webhook-testing'
import type { WebhookConfig, RuleSeverity } from '@/lib/types'

interface TestResult {
  success: boolean
  statusCode?: number
  responseTime: number
  error?: string
  payload?: any
  timestamp: number
}

interface WebhookTesterProps {
  webhook: WebhookConfig
}

export function WebhookTester({ webhook }: WebhookTesterProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testSeverity, setTestSeverity] = useState<RuleSeverity>('info')

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
      try {
        setProgress(((i + 1) / burstSize) * 100)
        const result = await testWebhookWithDetails(webhook, testSeverity)
        results.push(result)
        
        if (i < burstSize - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (error) {
        results.push({
          success: false,
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        })
      }
    }

    setTestResults((prev) => [...results, ...prev].slice(0, 20))
    setIsTesting(false)
    setTimeout(() => setProgress(0), 1000)
  }

  const calculateStats = () => {
    if (testResults.length === 0) return null

    const successCount = testResults.filter(r => r.success).length
    const totalCount = testResults.length
    const successRate = (successCount / totalCount) * 100

    const successfulTests = testResults.filter(r => r.success)
    const avgResponseTime = successfulTests.length > 0
      ? successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length
      : 0

    return {
      total: totalCount,
      successCount,
      failCount: totalCount - successCount,
      successRate,
      avgResponseTime
    }
  }

  const stats = calculateStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flask size={24} weight="bold" />
          Connectivity Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
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

            <div className="flex gap-2">
              <Button
                onClick={runSingleTest}
                disabled={isTesting}
              >
                <Flask size={18} />
                Single Test
              </Button>
              <Button
                onClick={runBurstTest}
                disabled={isTesting}
                variant="outline"
              >
                <Flask size={18} />
                Burst Test (5x)
              </Button>
            </div>
          </div>

          {isTesting && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center">
                Testing webhook endpoint...
              </p>
            </div>
          )}
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Tests</p>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>

              <div className="bg-success/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                <div className="text-2xl font-bold text-success">{stats.successRate.toFixed(0)}%</div>
              </div>

              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Avg Response</p>
                <div className="text-2xl font-bold text-primary">{stats.avgResponseTime.toFixed(0)}ms</div>
              </div>

              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Failed</p>
                <div className="text-2xl font-bold text-accent">{stats.failCount}</div>
              </div>
            </div>
          </>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            Test History
          </h4>

          {testResults.length === 0 ? (
            <Alert>
              <AlertDescription>
                No tests run yet. Click "Single Test" or "Burst Test" to begin testing this webhook endpoint.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={`${result.timestamp}-${index}`}
                  className={`border rounded-lg p-3 ${
                    result.success
                      ? 'bg-success/5 border-success/20'
                      : 'bg-destructive/5 border-destructive/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      {result.success ? (
                        <CheckCircle size={20} weight="fill" className="text-success mt-0.5" />
                      ) : (
                        <XCircle size={20} weight="fill" className="text-destructive mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {result.success ? 'Success' : 'Failed'}
                          </span>
                          {result.statusCode && (
                            <Badge variant="outline" className="text-xs">
                              HTTP {result.statusCode}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {result.responseTime}ms
                          </Badge>
                        </div>
                        {result.error && (
                          <p className="text-xs text-destructive break-all">
                            {result.error}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
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
