import { useState } from 'react'
import { Card, CardContent, CardDescription
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, S
import { Dialog, DialogContent, DialogDescrip
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, Broadcast, CheckCircle, W
import { testWebhook } from '@/lib/webhooks'
interface WebhooksProps {
}
export function Webhooks({ onW
  const [showDialog, setShowDialog] = useState(false)
  
    name: '',

interface WebhooksProps {
  onWebhookAdded?: () => void
}

export function Webhooks({ onWebhookAdded }: WebhooksProps) {
  const [webhooks, setWebhooks] = useKV<WebhookConfig[]>('webhooks', [])
  const [showDialog, setShowDialog] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    provider: 'slack' as 'slack' | 'pagerduty' | 'teams',
    url: '',
    enabled: true,
    severityFilter: ['critical', 'warning', 'info'] as RuleSeverity[]
  })


    
      name: '',
      url: '
     

    toast.success('Webhook added succes
  }
  const handleDeleteWebhoo
    toast.success('Webhook deleted

    setWebhooks((current) =>
    )
  }
  con

      if (success) {
    
      }
      toast.err
      setTesting(null)
  }
  const toggleSeveri
      ...prev,
      
    

    <Card>
        <div className
   

            <CardDescription>
            </CardDescription>
          
   

              </Button>
            <DialogContent c
                <DialogTitle>Add Webhook Integration</DialogTitle>
     
              </DialogHeader>
   

                    id="webhook-name"
                    value=
         

                  <L
                    value={formData.provider}
              
                  >
       
                    <
                      <SelectItem value="p
               
                </div>
     
   

                      formData.provider === 'slack'
                        : 
              
                    value={formData.url}
                  />
                    {formData.provider === '
       
   

          
          
                  
                      variant={formData.severityFilter.incl
               
                      Critical
                    <Button
                      variant={for
                      on
                      Warning
                    <Button
                      variant=
                
          
                  </div>

                  <Label htmlFor="webhook-enabled">Enable 
                    id="webhook-enabled"
                    onCheck
                </div>

                <Button variant="outline" onClic
                </Button>
              </DialogFooter>
          </Dialog>
      </CardHeader>
      <CardContent>
          <div className="tex

              Add a webhook to start sending a
          </div>
          <div className="space-y-4">
              <div key={
                  <div className="fle
                      <h3 className="font-semibold"
                        {webhook.provider
                      {webhook.enabled ? (
                    
                      

                          Disabled
                      )}
                    <p cl
                    </p>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {we
                   
                      className="text-xs"
                      {severity}
                  ))}


                  <Button
                    variant="outline
                    disable
                    {t

                    size="sm"
                    onClick={() => handleToggleWebhook(webhook.id)
                    {web

                    size="sm"
                    onClick={() =
                  >
                  </Button>
              </div>
          </div>
      </CardContent>
  )





























































































                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {webhook.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">Severity filter:</span>
                  {webhook.severityFilter.map((severity) => (
                    <Badge
                      key={severity}
                      variant="outline"
                      className="text-xs"
                    >
                      {severity}
                    </Badge>
                  ))}
                </div>

                <Separator className="my-3" />

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestWebhook(webhook)}
                    disabled={testing === webhook.id || !webhook.enabled}
                  >
                    {testing === webhook.id ? 'Testing...' : 'Test'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleWebhook(webhook.id)}
                  >
                    {webhook.enabled ? 'Disable' : 'Enable'}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="ml-auto"
                  >
                    <Trash size={16} weight="bold" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
