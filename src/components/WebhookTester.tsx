import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/co
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

  webhook: WebhookConfig


  responseTime: number
  payload?: any
}

  const [isTesting, se
  const [progress,
  const runSingleTest
    setProgress(0)
    try {
        setProg

 

      setTestResults((prev) => [result, ...prev].slice(0, 10))
      const errorResult: TestResult = {
        responseTime: 0,
        timestamp: Date.now()
      setTestResults((prev) => [errorResult, 

    }
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
  const calculateStats = () => {

    const successRate = (successCount / t
      .filter(r => r.success)

      total
      failCount: testResults.length - successCount,
      avgResponseTime
  }
  const stats = calcul
  return (
      <CardHeader>
          <div>
              <Flask size={24} 
          
       

      </CardHeader>
      <CardContent className="space-y-6">
       
     

                </SelectTrigger>
                  <Sele
                  <SelectItem value="criti
   

              <Button
                disabled={isTesting}

                Single Test
              <Button
                disabled={isTesting}
                <Flask size={
              </Button>

          {i
              <Progress value={p
                Tes
            </div>
        </div>
        {stats && (
     
   

              </div>

          
                <div className="text-2xl font-bol
              </di
                <div className="text-2xl font-bold text-pr
              <
                <div className="text-2xl font-bold text-acc
              </div>

          </>

          <h4 className="font-semibold text-sm flex items-cen
            Test History

            <A
              <Aler

          ) : (
              {testResults.map((result, index) => (
                  key={`${result.timestamp}-${index}`}
                    result.success
                      : 'bg-destructive/5 border-destructive/20'
                >
                    {result.suc
                    ) : (
                    )}
                    <div classN
                        <span className="text-sm font-medium
                        </span>
                          <Badge variant="outline" className="text-x
                          </Badg
                       
                  

                        <p className="text-xs tex
                     
                      
                        {new Date(re
                    </div>
               
            </div>
        </div>
        {testResults.so
            <Warning 
              Some tests failed. Check
          </Alert>
      </CardCon
  )


































































































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
