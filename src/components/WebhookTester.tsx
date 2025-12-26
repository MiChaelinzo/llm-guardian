import { useState } from 'react'
import { Button } from '@/components/ui/butto
import { Alert, AlertDescription } from '@/comp
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flask, CheckCircle, XCircle } from '@phosphor-icons/react'
  success: boolean
  responseTime: number


  webhook: Webhook

  responseTime: number
  const [testRes
  const runSingleTe
}

      const result = await tes
      
 

        error: error instanceof Error ? error.message : 'Unknown
      }, ...prev].slice(0, 20))

    setTimeout(() => setProgress(0), 1000)


    const burstSize = 5
    setIsTesting(true)
    setProgress(0)

    try {
      setProgress(50)
      const result = await testWebhookWithDetails(webhook, testSeverity)
      setProgress(100)
      
      setTestResults((prev) => [result, ...prev].slice(0, 20))
    } catch (error) {
      setTestResults((prev) => [{
        success: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }, ...prev].slice(0, 20))
    }

    setIsTesting(false)
    setTimeout(() => setProgress(0), 1000)


  const runBurstTest = async () => {
    setIsTesting(true)
    setProgress(0)
    const burstSize = 5

              <label className="text
                <SelectTrigger>
           
                  <SelectItem value="info">Info<
                  <SelectItem value="critical">Critical</SelectItem>
              </Select>

              <Button
                disabled={isTesting}
         
                Single 
              <Button
                disabled=
              >
                Burst Test (5x)
            </div>

       
     

          )}

          <div className="grid grid-cols-2
   

  const calculateStats = () => {
              <div className="text-2xl font-b

              <p className="text-sm text-muted-foreground mb-1">Av
            </div>
            <div className="bg-accent/10 rounded-lg p-4">

          </div>

          <h4 className="font-semibold text-sm flex items-center gap-2">
         

            
              </AlertDes
          ) : (
              {testResults.map((result, idx
                  
      avgResponseTime
     
  }

                        <CheckCi

  return (
          
      <CardHeader>
                            <Badge variant="outline" cl
                            </Badge>
                          <Bad
                    
      </CardHeader>
      <CardContent className="space-y-6">
                        )}
                          {new Date(result.times
                      </div>
                  </div>
              ))}
          )}
      </CardContent>
                </SelectTrigger>









              <Button

                disabled={isTesting}
                size="default"


                Single Test

              <Button

                disabled={isTesting}




              </Button>
            </div>










        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Tests</p>
              <div className="text-2xl font-bold">{stats.total}</div>


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




            Test Results








          ) : (

              {testResults.map((result, idx) => (

                  key={idx}

                    result.success

                      : 'bg-destructive/5 border-destructive/20'

                >








                        <div className="flex items-center gap-2 mb-1 flex-wrap">





















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
