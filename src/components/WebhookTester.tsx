import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/pro
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
  webhook: WebhookConf
  error?: string
export function
  timestamp: number
 

interface WebhookTesterProps {
  webhook: WebhookConfig
}

export function WebhookTester({ webhook }: WebhookTesterProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testSeverity, setTestSeverity] = useState<RuleSeverity>('info')

  const runSingleTest = async () => {

    setIsTesting(t

    const
      try {
        const result = await testWebhookWithDetails(we
        

      } catch (error) {
      
          error: error instanceof Err
        })

    setTestResults((prev) => [...results, ...prev].slice(0, 20
    setTimeout(() => 

    if (testResults.len
    const successCount =
    const successRate = (successCount / totalCount) * 100
    const successfulTests = t
      ?

      total: to
      failCount: totalCou
      avgResponseTime
  }
  c

      <CardHeader>
          <Flask size=
        </CardTitl
      <CardContent clas

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

                variant="outline
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
              </div>
    }
   

  const stats = calculateStats()

          
    <Card>
              <div
        <CardTitle className="flex items-center gap-2">
          <Flask size={24} weight="bold" />
          Connectivity Testing
        </CardTitle>
          </h4>
          {testResults.length === 0 ? (
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Test Severity</label>
              <Select value={testSeverity} onValueChange={(v) => setTestSeverity(v as RuleSeverity)}>
                <SelectTrigger>
                  <SelectValue />
                    result.succe
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
                     
                onClick={runSingleTest}
                            <Badge v
              >
                <Flask size={18} />
                           
              </Button>
                     
                onClick={runBurstTest}
                          </p>
                variant="outline"
              >
                <Flask size={18} />
                Burst Test (5x)
                  </div

          </div>

          {isTesting && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center">
                Testing webhook endpoint...
              </p>
            </div>
          )}
}


          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Tests</p>
                <div className="text-2xl font-bold">{stats.total}</div>


              <div className="bg-success/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                <div className="text-2xl font-bold text-success">{stats.successRate.toFixed(0)}%</div>


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

          </h4>

          {testResults.length === 0 ? (
            <Alert>
              <AlertDescription>
                No tests run yet. Click "Single Test" or "Burst Test" to begin testing this webhook endpoint.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 max-h-96 overflow-y-auto">

                <div

                  className={`border rounded-lg p-3 ${

                      ? 'bg-success/5 border-success/20'

                  }`}

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




















