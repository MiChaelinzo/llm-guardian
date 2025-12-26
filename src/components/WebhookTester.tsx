import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { testWebhookWithDetails } from '@/lib/webhook-testing'
import { Flask, CheckCircle, XCircle, Clock, Info } from '@phosphor-icons/react'
import type { WebhookConfig, RuleSeverity } from '@/lib/types'

interface TestResult {
  success: boolean
  statusCode?: number
  responseTime: number
  error?: string
  timestamp: number
}

interface WebhookHealth {
  webhookId: string
  lastTestTime?: number
  lastTestSuccess?: boolean
  totalTests: number
  successCount: number
  avgResponseTime: number
}

interface WebhookTesterProps {
  webhook: WebhookConfig
}

export function WebhookTester({ webhook }: WebhookTesterProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isTesting, setIsTesting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [testSeverity, setTestSeverity] = useState<RuleSeverity>('info')
  const [webhookHealth, setWebhookHealth] = useKV<Record<string, WebhookHealth>>('webhook-health', {})

  const updateHealthStats = (result: TestResult) => {
    setWebhookHealth((current) => {
      const health = current?.[webhook.id] || {
        webhookId: webhook.id,
        totalTests: 0,
        successCount: 0,
        avgResponseTime: 0
      }

      const newTotalTests = health.totalTests + 1
      const newSuccessCount = health.successCount + (result.success ? 1 : 0)
      const newAvgResponseTime = 
        (health.avgResponseTime * health.totalTests + result.responseTime) / newTotalTests

      return {
        ...current,
        [webhook.id]: {
          webhookId: webhook.id,
          lastTestTime: result.timestamp,
          lastTestSuccess: result.success,
          totalTests: newTotalTests,
          successCount: newSuccessCount,
          avgResponseTime: newAvgResponseTime
        }
      }
    })
  }

  const runSingleTest = async () => {
    setIsTesting(true)
    setProgress(0)

    try {
      setProgress(50)
      const result = await testWebhookWithDetails(webhook, testSeverity)
      setProgress(100)
      
      setTestResults((prev) => [result, ...prev].slice(0, 20))
      updateHealthStats(result)
    } catch (error) {
      const failedResult = {
        success: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
      setTestResults((prev) => [failedResult, ...prev].slice(0, 20))
      updateHealthStats(failedResult)
    }

    setIsTesting(false)
    setTimeout(() => setProgress(0), 1000)
  }

  const runBurstTest = async () => {
    setIsTesting(true)
    setProgress(0)
    const burstSize = 5

    try {
      const results: TestResult[] = []
      
      for (let i = 0; i < burstSize; i++) {
        setProgress(((i + 1) / burstSize) * 100)
        
        try {
          const result = await testWebhookWithDetails(webhook, testSeverity)
          results.push(result)
          updateHealthStats(result)
        } catch (error) {
          const failedResult = {
            success: false,
            responseTime: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
          }
          results.push(failedResult)
          updateHealthStats(failedResult)
        }

        if (i < burstSize - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      setTestResults((prev) => [...results, ...prev].slice(0, 20))
    } catch (error) {
      const failedResult = {
        success: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
      setTestResults((prev) => [failedResult, ...prev].slice(0, 20))
      updateHealthStats(failedResult)
    }

    setIsTesting(false)
    setTimeout(() => setProgress(0), 1000)
  }

  const calculateStats = () => {
    if (testResults.length === 0) return null

    const successCount = testResults.filter(r => r.success).length
    const failCount = testResults.length - successCount
    const successRate = (successCount / testResults.length) * 100
    const avgResponseTime = testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length

    return {
      total: testResults.length,
      successCount,
      failCount,
      successRate,
      avgResponseTime
    }
  }

  const stats = calculateStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Flask size={20} />
          Test Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Test Severity</label>
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

            <div className="flex gap-2 w-full md:w-auto">
              <Button
                onClick={runSingleTest}
                disabled={isTesting}
                className="flex-1 md:flex-none"
              >
                <Flask size={18} />
                Single Test
              </Button>
              <Button
                onClick={runBurstTest}
                disabled={isTesting}
                variant="secondary"
                className="flex-1 md:flex-none"
              >
                <Flask size={18} />
                Burst Test (5x)
              </Button>
            </div>
          </div>

          {progress > 0 && (
            <Progress value={progress} className="h-2" />
          )}
        </div>

        {stats && (
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
        )}

        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Clock size={16} />
            Test Results
          </h4>

          {testResults.length === 0 ? (
            <Alert>
              <Info size={18} />
              <AlertDescription>
                No test results yet. Run a test to see webhook connectivity status.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-3 ${
                    result.success
                      ? 'bg-success/5 border-success/20'
                      : 'bg-destructive/5 border-destructive/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {result.success ? (
                          <CheckCircle size={16} weight="fill" className="text-success flex-shrink-0" />
                        ) : (
                          <XCircle size={16} weight="fill" className="text-destructive flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm">
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
                        <p className="text-sm text-muted-foreground break-words">{result.error}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
