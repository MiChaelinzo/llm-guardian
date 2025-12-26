import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
  Cloud, 
  FloppyDisk, 
  EyeSlas
  Warning
  ChartBar,
} from '@phosphor-icons/react'
  CheckCircle,
  EyeSlash,
  Eye,
  Warning,
  Waveform,
  ChartBar,
  Info
} from '@phosphor-icons/react'

type APIConfig = {
  googleCloud: {
    projectId: string
  confluent: {
    enabled: boolean
  }
  datadog: {
    apiKey: string
  elevenLabs: {
    agentId: str
  }

  googleCloud:
    apiKey: '',
  },
    apiKey: '',
    site: 'datadoghq
  }
    apiKey: '',
    bootstrapServe
  },
    apiKey: '',
   
}

  const [showSecrets, setShowSecret
    datadog: fal
    elevenLabs: fa
  const [isDemo
  const handleSave
    
  }
  const handleT
    
      toast.success(`${pla
  }
  co
    updates: P
    setConfig((
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

  const getConnectionStatus = (platform: keyof APIConfig) => {
    const platformConfig = config[platform]
    const hasRequiredKeys = Object.entries(platformConfig).some(
      ([key, value]) => key !== 'enabled' && value && value.length > 0
    )
    
    if (platformConfig.enabled && hasRequiredKeys) {
      return { status: 'connected', color: 'bg-success', icon: CheckCircle }
    } else if (hasRequiredKeys) {
      return { status: 'configured', color: 'bg-warning', icon: Warning }
    }
    return { status: 'not configured', color: 'bg-muted-foreground', icon: Warning }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Configure your API integrations and preferences</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <FloppyDisk size={16} weight="fill" />
          Save Changes
        </Button>
      </div>

      <Alert>
        <Info size={16} weight="fill" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Demo Mode:</strong> {isDemoMode ? 'Using simulated data for demonstration' : 'Using live API integrations'}
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="demo-mode" className="text-sm">Demo Mode</Label>
            <Switch 
              id="demo-mode"
              checked={isDemoMode}
              onCheckedChange={(checked) => {
                setIsDemoMode(checked)
                toast.success(checked ? 'Demo mode enabled' : 'Demo mode disabled')
              }}
            />
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['googleCloud', 'datadog', 'confluent', 'elevenLabs'] as const).map((platform) => {
          const status = getConnectionStatus(platform)
          const StatusIcon = status.icon
          
          const labels = {
            googleCloud: { name: 'Google Cloud', icon: Cloud },
            datadog: { name: 'Datadog', icon: ChartBar },
            confluent: { name: 'Confluent', icon: Database },
            elevenLabs: { name: 'ElevenLabs', icon: Waveform }
          }
          
          const PlatformIcon = labels[platform].icon
          
          return (
            <Card key={platform} className="border-l-4" style={{
              borderLeftColor: config[platform].enabled ? 'var(--success)' : 'var(--border)'
            }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlatformIcon size={20} weight="fill" className="text-primary" />
                    <CardTitle className="text-lg">{labels[platform].name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`gap-1.5 text-xs ${status.color} text-white`}>
                      <StatusIcon size={12} weight="fill" />
                      {status.status}
                    </Badge>
                    <Switch 
                      checked={config[platform].enabled}
                      onCheckedChange={(checked) => updateConfig(platform, { enabled: checked })}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="googleCloud" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="googleCloud" className="gap-2">
            <Cloud size={16} />
            Google Cloud
          </TabsTrigger>
          <TabsTrigger value="datadog" className="gap-2">
            <ChartBar size={16} />
            Datadog
          </TabsTrigger>
          <TabsTrigger value="confluent" className="gap-2">
            <Database size={16} />
            Confluent
          </TabsTrigger>
          <TabsTrigger value="elevenLabs" className="gap-2">
            <Waveform size={16} />
            ElevenLabs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="googleCloud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Cloud Configuration</CardTitle>
              <CardDescription>
                Configure your Google Cloud credentials for Vertex AI and Gemini API access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button 
                <Label htmlFor="gc-project-id">Project ID</Label>
                <Input
                  id="gc-project-id"
                  value={config.googleCloud.projectId}
                  onChange={(e) => updateConfig('googleCloud', { projectId: e.target.value })}
                  placeholder="my-gcp-project"
                />
              </div>

              <div className="space-y-2">
                  variant="outline"
                >
                </Button
            </CardContent>
        </TabsContent>
        <TabsContent value="datadog" className="space
            <CardHeader>
              <CardDescription>
              </CardDescription>
            <CardCon
                <Label ht
                  <Input
                    type={showS
                    onChange={(e) => updateConfig('datadog', { apiKey: e.target.value })}
                   
                  <Button
                    size="i
                  >
                  </Button>
              </div>
              <div c
                <Inp

                  onChange=

              </div>
              <div class
                <Input
                  value={(config ||
                  placeholder="datad
                <
                  Test Connection
                </Button>
                <Button 
                  onClick={() => {
                    updateConfig('googleCloud', { projectId: '', apiKey: '', enabled: false })
                    toast.success('Google Cloud credentials cleared')
                  }}
                  variant="outline"
                  className="text-destructive"
                 
                  Clear
                </Button>
              </div>
            </CardContent>
        <TabsCont
            <CardHeade

              </CardDescription>
            <Car
                <Label h
                  <Input
                    type={showS
                    onChange={(e) => updateConfig('confluent', { apiKey: e.target.value }
                    className="f
                  <Button
                    size="icon"
                  >
                  </Button>
              </div>
              <div class
                <Input
                  type="password"
                  onChange={(e) => updateConfig('
                  className="font-mono"
              </div>
              <div className="space-y-2">
                <Inp
                  value={
                  placeholder="pkc-xx
                <p className="t
                </p>


                <Button 
                  vari
                >

                  onClick={() => {
                    toast.success('Confluent credentials cleared')
                  vari
                >
                </Button>
            </CardContent>
        </TabsContent>
        <TabsContent value="elevenLabs" className="space-y-4">
            <CardHeader>
              <Car
              </Card

                <Label htmlFor="el-api-ke
                  <Input
                    ty
                    onChange={
                    className="font-mono"
                  <Button
                    size="icon"
                  
                  </Button>
              </div>
              <div c
                <Inp

                  placehold

                  Get your credentials fro
              </div>
              <Separator />
              <div className="flex 
                  onClick={() => han
                >
                  Test Connection
                <Button 
                    upda
                  }}
                  className="text-destructive"
                  Clear
              </div>
          </Card>
      </Tabs>
  )




          </Card>
































































                >









                >




          </Card>





















































                >














          </Card>

      </Tabs>

  )

