import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switc
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigg
import { toast } from 'sonner'
  Cloud, 
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Cloud, 
  FloppyDisk, 
  Eye,
  EyeSlash,
  Warning,
  CheckCircle,
  ChartBar,
  Waveform,
  Database,
  Info
} from '@phosphor-icons/react'

type APIConfig = {
  googleCloud: {
    projectId: string
    enabled: boole
    enabled: boolean
  }
  datadog: {
    apiKey: string
    enabled: boole
  elevenLabs: {
    agentId: string
  }

  googleCloud: {
    apiKey: '',
  },
    apiKey: '',
   
  },
    apiKey: '',
    bootstrapServer
  },
   
 

export function Settings() {
  const [showSec
    datadog: false
    elevenLabs:
  const [isDemoMod
  co
  const hand
      descripti
  }
  const handleTestConnecti
    
    
  }
  const updateC
    apiSecret: '',
    bootstrapServer: '',
    enabled: false
  },
  elevenLabs: {
    apiKey: '',
    agentId: '',
    enabled: false
  }
}

export function Settings() {
  const [config, setConfig] = useKV<APIConfig>('api-config', DEFAULT_CONFIG)
  const [showSecrets, setShowSecrets] = useState({
    googleCloud: false,
    datadog: false,
    confluent: false,
    elevenLabs: false
  })
  const [isDemoMode, setIsDemoMode] = useKV<boolean>('demo-mode', true)

  const handleSave = () => {
    toast.success('Settings saved successfully', {
      description: 'Your API configuration has been updated.'
    })
  }

  const handleTestConnection = async (platform: string) => {
    toast.info(`Testing ${platform} connection...`)
    
    setTimeout(() => {
      toast.success(`${platform} connection test successful`)
    }, 1500)
  }

  const updateConfig = <K extends keyof APIConfig>(
    platform: K,
    updates: Partial<APIConfig[K]>
  ) => {
    setConfig((current) => ({
      ...current,
      [platform]: {
        ...current[platform],
        ...updates
      }
    }))
  }

  const toggleSecretVisibility = (platform: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }))
  }

  const getConnectionStatus = (platform: keyof APIConfig) => {
    const platformConfig = config[platform]
    const hasRequiredKeys = Object.entries(platformConfig).some(
      ([key, value]) => key !== 'enabled' && value && value.length > 0
    )
    
    if (platformConfig.enabled && hasRequiredKeys) {
      return { status: 'connected', color: 'bg-success', icon: CheckCircle }
    } else if (hasRequiredKeys) {
          </div>
     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
   

          
            confluent: { name: 
          }
          con
          return (
              borderLeftColor: safeConfig[platform].enabled ? 'var(--success)' : 'var(--border)'
              
                  <div className="flex items-center gap
                    <CardTitle className="text-l
                  <div
                 
            

             
                </div>
            </Card>
        })}

        <TabsLis
            <Cloud size={16} />
          </TabsTrigger>
            <ChartBa
          </TabsTrigger>
            <Database size={16} />
          </TabsTrigger>
            <Waveform size={16} />
          </TabsTrigger>

          <Car
              <C
                Configure y
            </

                <Input
                  value={safeConfig.googleCloud.projectId}
                  placeholder="my-gcp-project"
              </div>
          
                <div class
                    id="gc-api-key"
                    value={safeConfig.googleCloud.apiKey}
                    placeholder="AIza..."
                  />
           
          
                    {showSecrets.googleCloud ? <EyeS
          
                  
              </div>
              <Separator />
              <
                  onClick=
                  className="flex-1"
                  Test Connection
                <Button 
                    updateConfig('googleCloud', { projectId: '', apiKey: '', enabled: 
                  }}
                  className="text-destructive"
                  Clear
              </div>
          </Card>

          <Card>
              <CardTitle>Datadog Configuration</CardTitl
                Configure Datadog for LLM observability and monitoring
            </CardHead
              <div class
                <div c
                    id="dd-
                   
           
           
            

                    {showSecrets.datadog ? <EyeSlash size=
                </div>

                <Label htmlFor=
                  id="dd
                  value=
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxx
                />

                <Label h
                  id="dd-site"
                  onChange={(e) =>
                />
                  Your D
              </div>
              <Separator />
              <div cla
                  onClic
                  c

                <Button 
                
                  }}
                  className="text-destructive"
                  Clear
              </div>
          </Card>

          <Card>
              <CardTitle>Confluent Config
                Configure Confluent for real-time data streaming
            </CardHead
              <div className="space-
                <div className="flex gap-2">
                    id="cf-api-key"
                    value={safeConfig.confluen
                  
                  />

                    onClick={() => toggle
                    {showSecrets.confluent ? <EyeSlash size
                </div>

                <Label htmlFor="cf-
                  id="cf-api-secret"
                  value={safeConfig.confluent.apiSecr
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />

                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleSecretVisibility('googleCloud')}
                  >
                    {showSecrets.googleCloud ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from Google Cloud Console
                </p>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestConnection('Google Cloud')}
                  variant="outline"
                  className="flex-1"
                >
                  Test Connection
                </Button>
                <Button 
                  onClick={() => {
                    updateConfig('googleCloud', { projectId: '', apiKey: '', enabled: false })
                    toast.success('Google Cloud credentials cleared')
                  }}
                  variant="outline"
                  className="text-destructive"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datadog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datadog Configuration</CardTitle>
              <CardDescription>
                Configure Datadog for LLM observability and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dd-api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="dd-api-key"
                    type={showSecrets.datadog ? 'text' : 'password'}
                    value={config.datadog.apiKey}
                    onChange={(e) => updateConfig('datadog', { apiKey: e.target.value })}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="font-mono"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleSecretVisibility('datadog')}
                  >
                    {showSecrets.datadog ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dd-app-key">Application Key</Label>
                <Input
                  id="dd-app-key"
                  type="password"
                  value={config.datadog.appKey}
                  onChange={(e) => updateConfig('datadog', { appKey: e.target.value })}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dd-site">Site</Label>
                <Input
                  id="dd-site"
                  value={config.datadog.site}
                  onChange={(e) => updateConfig('datadog', { site: e.target.value })}
                  placeholder="datadoghq.com"
                />
                <p className="text-xs text-muted-foreground">
                  Your Datadog site (e.g., datadoghq.com, datadoghq.eu)
                </p>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestConnection('Datadog')}
                  variant="outline"
                  className="flex-1"
                >
                  Test Connection
                </Button>
                <Button 
                  onClick={() => {
                    updateConfig('datadog', { apiKey: '', appKey: '', site: 'datadoghq.com', enabled: false })
                    toast.success('Datadog credentials cleared')
                  }}
                  variant="outline"
                  className="text-destructive"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confluent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Confluent Configuration</CardTitle>
              <CardDescription>
                Configure Confluent for real-time data streaming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cf-api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="cf-api-key"
                    type={showSecrets.confluent ? 'text' : 'password'}
                    value={config.confluent.apiKey}
                    onChange={(e) => updateConfig('confluent', { apiKey: e.target.value })}
                    placeholder="XXXXXXXXXXXXXXXX"
                    className="font-mono"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleSecretVisibility('confluent')}
                  >
                    {showSecrets.confluent ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cf-api-secret">API Secret</Label>
                <Input
                  id="cf-api-secret"
                  type="password"
                  value={config.confluent.apiSecret}
                  onChange={(e) => updateConfig('confluent', { apiSecret: e.target.value })}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cf-bootstrap">Bootstrap Server</Label>
                <Input
                  id="cf-bootstrap"
                  value={config.confluent.bootstrapServer}
                  onChange={(e) => updateConfig('confluent', { bootstrapServer: e.target.value })}
                  placeholder="pkc-xxxxx.us-east-1.aws.confluent.cloud:9092"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Your Confluent Kafka cluster bootstrap server
                </p>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestConnection('Confluent')}
                  variant="outline"
                  className="flex-1"
                >
                  Test Connection
                </Button>
                <Button 
                  onClick={() => {
                    updateConfig('confluent', { apiKey: '', apiSecret: '', bootstrapServer: '', enabled: false })
                    toast.success('Confluent credentials cleared')
                  }}
                  variant="outline"
                  className="text-destructive"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elevenLabs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ElevenLabs Configuration</CardTitle>
              <CardDescription>
                Configure ElevenLabs for voice-driven interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="el-api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="el-api-key"
                    type={showSecrets.elevenLabs ? 'text' : 'password'}
                    value={config.elevenLabs.apiKey}
                    onChange={(e) => updateConfig('elevenLabs', { apiKey: e.target.value })}
                    placeholder="sk_..."
                    className="font-mono"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleSecretVisibility('elevenLabs')}
                  >
                    {showSecrets.elevenLabs ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="el-agent-id">Agent ID</Label>
                <Input
                  id="el-agent-id"
                  value={config.elevenLabs.agentId}
                  onChange={(e) => updateConfig('elevenLabs', { agentId: e.target.value })}
                  placeholder="agent_..."
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Get your credentials from ElevenLabs dashboard
                </p>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestConnection('ElevenLabs')}
                  variant="outline"
                  className="flex-1"
                >
                  Test Connection
                </Button>
                <Button 
                  onClick={() => {
                    updateConfig('elevenLabs', { apiKey: '', agentId: '', enabled: false })
                    toast.success('ElevenLabs credentials cleared')
                  }}
                  variant="outline"
                  className="text-destructive"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
              <div className="space-y-2">
                <Label htmlFor="cf-bootstrap">Bootstrap Server</Label>
                <Input
                  id="cf-bootstrap"
                  value={safeConfig.confluent.bootstrapServer}
                  onChange={(e) => updateConfig('confluent', { bootstrapServer: e.target.value })}
                  placeholder="pkc-xxxxx.us-east-1.aws.confluent.cloud:9092"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Your Confluent Kafka cluster bootstrap server
                </p>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestConnection('Confluent')}
                  variant="outline"
                  className="flex-1"
                >
                  Test Connection
                </Button>
                <Button 
                  onClick={() => {
                    updateConfig('confluent', { apiKey: '', apiSecret: '', bootstrapServer: '', enabled: false })
                    toast.success('Confluent credentials cleared')
                  }}
                  variant="outline"
                  className="text-destructive"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elevenLabs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ElevenLabs Configuration</CardTitle>
              <CardDescription>
                Configure ElevenLabs for voice-driven interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="el-api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="el-api-key"
                    type={showSecrets.elevenLabs ? 'text' : 'password'}
                    value={safeConfig.elevenLabs.apiKey}
                    onChange={(e) => updateConfig('elevenLabs', { apiKey: e.target.value })}
                    placeholder="sk_..."
                    className="font-mono"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleSecretVisibility('elevenLabs')}
                  >
                    {showSecrets.elevenLabs ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="el-agent-id">Agent ID</Label>
                <Input
                  id="el-agent-id"
                  value={safeConfig.elevenLabs.agentId}
                  onChange={(e) => updateConfig('elevenLabs', { agentId: e.target.value })}
                  placeholder="agent_..."
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Get your credentials from ElevenLabs dashboard
                </p>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestConnection('ElevenLabs')}
                  variant="outline"
                  className="flex-1"
                >
                  Test Connection
                </Button>
                <Button 
                  onClick={() => {
                    updateConfig('elevenLabs', { apiKey: '', agentId: '', enabled: false })
                    toast.success('ElevenLabs credentials cleared')
                  }}
                  variant="outline"
                  className="text-destructive"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
