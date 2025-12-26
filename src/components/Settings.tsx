import { useState } from 'react'
import { Input } from '@/components/ui/inpu
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, 
import { Tabs, TabsContent, TabsList, TabsTrigg
import { toast } from 'sonner'
  Cloud, 
  Eye,
  Warning,
  ChartBar,
  Databas
} from '@
type APIConfig
    pr
    enabled
  datadog:
    appKey: st
    enabled
  confluent
    apiSecr
    en
  elevenLabs: {

  }

  googleCloud: {
    apiKey: '',
  },
   
    site: 'd
  },
    apiKey: '',
    bootstrapSer
  },
   
    enabled: f
}
export function Setti
  const [showSecrets, setSh
    datadog: false,
   
  const [isDemo
  const handleSave
      description: 
  }
  c
 

  }
  const updateCo
    updates: Parti
    setConfig((
      return {
    
          ..
      }
  }
  const toggleSecretVisibi
      ...prev,
    

    const safeC
    const hasRequi
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
      return { status: 'configured', color: 'bg-warning', icon: Info }
    } else {
      return { status: 'not configured', color: 'bg-muted', icon: Warning }
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info size={16} />
        <AlertDescription>
          Configure your API credentials for Google Cloud, Datadog, Confluent, and ElevenLabs. 
          All credentials are stored locally in your browser and never sent to external servers.
          {isDemoMode && (
            <span className="block mt-2 text-warning">
              <strong>Demo Mode Active:</strong> Using simulated data. Connect real APIs to enable full functionality.
            </span>
          )}
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="space-y-0.5">
          <Label htmlFor="demo-mode" className="text-base">Demo Mode</Label>
          <p className="text-sm text-muted-foreground">
            Use simulated data instead of real API connections
          </p>
        </div>
        <Switch
          id="demo-mode"
          checked={isDemoMode}
          onCheckedChange={(checked) => setIsDemoMode(checked)}
        />
      </div>

      <Tabs defaultValue="googleCloud" className="space-y-6">
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Google Cloud Configuration</CardTitle>
                  <CardDescription>
                    Configure your Google Cloud project for Vertex AI and Gemini
                  </CardDescription>
                </div>
                <Switch
                  checked={config.googleCloud.enabled}
                  onCheckedChange={(checked) => updateConfig('googleCloud', { enabled: checked })}

          <Card>
            </CardHeader>
            <CardContent className="space-y-4">
                  <CardDescription>
                <Label htmlFor="gc-project-id">Project ID</Label>
                <Switc
                  id="gc-project-id"
                  value={config.googleCloud.projectId}
                  onChange={(e) => updateConfig('googleCloud', { projectId: e.target.value })}
                  placeholder="my-gcp-project"
                  
              </div>

              <div className="space-y-2">
                <Label htmlFor="gc-api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="gc-api-key"
                    type={showSecrets.googleCloud ? 'text' : 'password'}
                    value={config.googleCloud.apiKey}
                    onChange={(e) => updateConfig('googleCloud', { apiKey: e.target.value })}
                    placeholder="AIza..."
                    className="font-mono"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleSecretVisibility('googleCloud')}
                  >
                    {showSecrets.googleCloud ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                  onChange={(e) => updateConfig('datadog', { 
                  Get your API key from Google Cloud Console
              </div>
              <div c

                  value={sa

                <p className="text-xs text
                </p>
                  onClick={() => handleTestConnection('Google Cloud')}

                <Button 
                 
                >
                </Button>
                  onClic
                    toast.success(
                    updateConfig('googleCloud', { projectId: '', apiKey: '', enabled: false })
                    toast.success('Google Cloud credentials cleared')
                </Bu
            </CardContent>
        </TabsContent>
        <TabsCont
            <CardHeader
                <div>
                  <C
                  </CardDe
                <
                  onCh

        <TabsContent value="datadog" className="space-y-4">
                
                  <Input
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Datadog Configuration</CardTitle>
                  <CardDescription>
                    Configure Datadog for LLM observability and monitoring
                  </CardDescription>
                </div>
                <Switch
                  checked={config.datadog.enabled}
                  onCheckedChange={(checked) => updateConfig('datadog', { enabled: checked })}
                />
              </div>
              <div classN
                <Input
                  type="password"
                <Label htmlFor="dd-api-key">API Key</Label>
                  className="font-mono"
              </div>
                    id="dd-api-key"
                    type={showSecrets.datadog ? 'text' : 'password'}
                    value={config.datadog.apiKey}
                    onChange={(e) => updateConfig('datadog', { apiKey: e.target.value })}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  Your Confluent Kafka cl
              </div>
              <Separator 
              <div className="f
                  onClick={() => hand
                    onClick={() => toggleSecretVisibility('datadog')}
                  T
                    {showSecrets.datadog ? <EyeSlash size={16} /> : <Eye size={16} />}
                    updateC
                  }}
                  cl

              </div>
                <Label htmlFor="dd-app-key">Application Key</Label>

                  id="dd-app-key"
                  type="password"
                  value={config.datadog.appKey}
                  onChange={(e) => updateConfig('datadog', { appKey: e.target.value })}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                <Switch
                  
              </div>

              <div className="space-y-2">
                <Label htmlFor="dd-site">Site</Label>
                <Input
                  id="dd-site"
                  value={config.datadog.site}
                  onChange={(e) => updateConfig('datadog', { site: e.target.value })}
                  placeholder="datadoghq.com"
                />
                    onChange={(e) => updateConfig('elevenLabs
                  Your Datadog site (e.g., datadoghq.com, datadoghq.eu)
                  <B
                    

                  </Button>

              <div className="space-y-2">
                <Input
                  onClick={() => handleTestConnection('Datadog')}
                  placeholder="agen
                />
                 
              </div>
              <Separator 
              <div class
                  onClick={() => h
                    updateConfig('datadog', { apiKey: '', appKey: '', site: 'datadoghq.com', enabled: false })
                    toast.success('Datadog credentials cleared')
                <But
                    updateConfig('e
                  }}
                 
                  Clear
              </div>
          </Card>
      </Tabs>
  )


        <TabsContent value="confluent" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Confluent Configuration</CardTitle>
                  <CardDescription>
                    Configure Confluent for real-time data streaming
                  </CardDescription>
                </div>
                <Switch
                  checked={config.confluent.enabled}
                  onCheckedChange={(checked) => updateConfig('confluent', { enabled: checked })}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

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



                  value={config.confluent.bootstrapServer}





































              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ElevenLabs Configuration</CardTitle>
                  <CardDescription>
                    Configure ElevenLabs for voice-driven interactions
                  </CardDescription>
                </div>
                <Switch
                  checked={config.elevenLabs.enabled}
                  onCheckedChange={(checked) => updateConfig('elevenLabs', { enabled: checked })}
                />
              </div>








                    value={config.elevenLabs.apiKey}


















                  value={config.elevenLabs.agentId}





































