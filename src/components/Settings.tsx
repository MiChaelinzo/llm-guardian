import { useState } from 'react'
import { Card, CardContent, CardDescription
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switc
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigg
  Cloud, 
  Database, 
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Cloud, 
  ChartBar, 
  Database, 
  Waveform, 
    apiKey: '',
  Warning, 
  },
  EyeSlash,
    bootstrap
} from '@phosphor-icons/react'
import type { APIConfig } from '@/lib/types'
import { toast } from 'sonner'

const DEFAULT_CONFIG: APIConfig = {
  googleCloud: {
    projectId: '',
    apiKey: '',
    enabled: false
  co
  datadog: {
      descripti
  }
  const handleTestConnecti
    
    
  }
  const updateC
    updates: Parti
    setConfig((current =
      [platform]: 
    
    }))

    const platfo
      ([key, value
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
                <Input
      <div className="flex items-center justify-between">
             
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Configure your API integrations and preferences</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <FloppyDisk size={16} weight="fill" />
          Save Changes
        </Button>
      </div>

      <Alert>
        <Warning size={16} weight="fill" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>Demo Mode: {isDemoMode ? 'Enabled' : 'Disabled'} - {isDemoMode ? 'Using simulated data for demonstration' : 'Using real API integrations'}</span>
            <Switch 
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
              <CardTitle>Datadog Configuration</CardTi
          const StatusIcon = status.icon
          
          const labels = {
            googleCloud: { name: 'Google Cloud', icon: Cloud },
            datadog: { name: 'Datadog', icon: ChartBar },
            confluent: { name: 'Confluent', icon: Database },
            elevenLabs: { name: 'ElevenLabs', icon: Waveform }
           
          
          const PlatformIcon = labels[platform].icon
          
          return (
            <Card key={platform} className="border-l-4" style={{
              borderLeftColor: config[platform].enabled ? 'var(--success)' : 'var(--border)'
            }}>
                    type={
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
                <Warning size={
            Google Cloud
              </Alert>
          <TabsTrigger value="datadog" className="gap-2">

            Datadog
              <CardTitle
          <TabsTrigger value="confluent" className="gap-2">
            <Database size={16} />
            Confluent
          </TabsTrigger>
          <TabsTrigger value="elevenLabs" className="gap-2">
                    value={current
            ElevenLabs
                  />
        </TabsList>

        <TabsContent value="googleCloud" className="space-y-4">
                
            <CardHeader>
              <CardTitle>Google Cloud Configuration</CardTitle>
              <CardDescription>
                Configure your Google Cloud credentials for Vertex AI and Gemini API access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gc-project-id">Project ID</Label>
                <Input
                  id="gc-project-id"
                  value={config.googleCloud.projectId}
                  onChange={(e) => updateConfig('googleCloud', { projectId: e.target.value })}
                  value={currentConfig.confluent.b
                />
              </div>


                <Label htmlFor="gc-api-key">API Key</Label>
                <Button 
                  <Input
                    id="gc-api-key"
                    type={showSecrets.googleCloud ? 'text' : 'password'}
                  onClick={() => {
                    onChange={(e) => updateConfig('googleCloud', { apiKey: e.target.value })}
                  variant="outline"
                    className="font-mono"
                </Bu
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecrets(s => ({ ...s, googleCloud: !s.googleCloud }))}
                  >
                    {showSecrets.googleCloud ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a>
                </p>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestConnection('Google Cloud')}
                  variant="outline"
                  className="flex-1"

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
                 
                >


                
                  Get yo
              </Alert>
          </Card>
      </Tabs>
  )
































































                >









                >





                <Warning size={16} weight="fill" />



              </Alert>

          </Card>

























































































                <Warning size={16} weight="fill" />



              </Alert>

          </Card>





















































                >















                <Warning size={16} weight="fill" />



              </Alert>

          </Card>

      </Tabs>

  )

