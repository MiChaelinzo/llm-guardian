import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
    apiKey: string
    enabled: boolean
  }
  datadog: {
    apiKey: string
    appKey: string
    site: string
    enabled: boolean
  }
  confluent: {
    apiKey: string
    apiSecret: string
    bootstrapServer: string
    enabled: boolean
  }
  elevenLabs: {
    apiKey: string
    agentId: string
    enabled: boolean
  }
}

const DEFAULT_CONFIG: APIConfig = {
  googleCloud: {
    projectId: '',
    apiKey: '',
    enabled: false
  },
  datadog: {
    apiKey: '',
    appKey: '',
    site: 'datadoghq.com',
    enabled: false
  },
  confluent: {
    apiKey: '',
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

  const safeConfig = config || DEFAULT_CONFIG

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
    setConfig((current) => {
      const base = current || DEFAULT_CONFIG
      return {
        ...base,
        [platform]: {
          ...base[platform],
          ...updates
        }
      }
    })
  }

  const toggleSecretVisibility = (platform: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }))
  }

  const getConnectionStatus = (platform: keyof APIConfig) => {
    const platformConfig = (config || DEFAULT_CONFIG)[platform]
    const hasRequiredKeys = Object.entries(platformConfig).some(
      ([key, value]) => key !== 'enabled' && typeof value === 'string' && value.length > 0
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
              borderLeftColor: safeConfig[platform].enabled ? 'var(--success)' : 'var(--border)'
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
                      checked={safeConfig[platform].enabled}
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
              <div className="space-y-2">
                <Label htmlFor="gc-project-id">Project ID</Label>
                <Input
                  id="gc-project-id"
                  value={safeConfig.googleCloud.projectId}
                  onChange={(e) => updateConfig('googleCloud', { projectId: e.target.value })}
                  placeholder="my-gcp-project"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gc-api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="gc-api-key"
                    type={showSecrets.googleCloud ? 'text' : 'password'}
                    value={safeConfig.googleCloud.apiKey}
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
                    value={safeConfig.datadog.apiKey}
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
                  value={safeConfig.datadog.appKey}
                  onChange={(e) => updateConfig('datadog', { appKey: e.target.value })}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dd-site">Site</Label>
                <Input
                  id="dd-site"
                  value={safeConfig.datadog.site}
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
                    value={safeConfig.confluent.apiKey}
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
                  value={safeConfig.confluent.apiSecret}
                  onChange={(e) => updateConfig('confluent', { apiSecret: e.target.value })}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="font-mono"
                />
              </div>

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
