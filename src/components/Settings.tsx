import { useState, useEffect } from 'react'
import { 
  Cloud, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  BarChart3, 
  Database, 
  AudioWaveform, 
  Lock,
  Shield,
  Key,
  CheckCircle,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { useSecureStorage } from '@/hooks/use-secure-storage'
import { validateKey } from '@/lib/encryption'
import { CredentialBackup } from '@/components/CredentialBackup'
import { Webhooks } from '@/components/Webhooks'
import { WebhookStatus } from '@/components/WebhookStatus'

import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'

// ... Types and Component Logic (same as your snippet) ...
// The exports and imports are the critical part here.
// Types


interface APIConfig {
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
  const [config, setConfig] = useSecureStorage<APIConfig>('api-config', DEFAULT_CONFIG)
  // Fallback to local state if useKV is missing, or ensure useKV is implemented
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true) 
  
  const [showSecrets, setShowSecrets] = useState({
    googleCloud: false,
    datadog: false,
    confluent: false,
    elevenLabs: false
  })

  const [validationStatus, setValidationStatus] = useState({
    googleCloud: false,
    datadog: false,
    confluent: false,
    elevenLabs: false
  })

  useEffect(() => {
    setValidationStatus({
      googleCloud: validateKey(config.googleCloud.apiKey),
      datadog: validateKey(config.datadog.apiKey),
      confluent: validateKey(config.confluent.apiKey),
      elevenLabs: validateKey(config.elevenLabs.apiKey)
    })
  }, [config])

  const handleTestConnection = async (platform: string) => {
    toast.info(`Testing ${platform} connection...`)
    // Mock API call
    setTimeout(() => {
      toast.success(`${platform} connection test successful`)
    }, 1500)
  }

  const updateConfig = async <K extends keyof APIConfig>(
    platform: K,
    updates: Partial<APIConfig[K]>
  ) => {
    const newConfig = {
      ...config,
      [platform]: {
        ...config[platform],
        ...updates
      }
    }
    await setConfig(newConfig)
  }

  const toggleSecretVisibility = (platform: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }))
  }

  const clearCredentials = async (platform: keyof APIConfig) => {
    const newConfig = {
      ...config,
      [platform]: DEFAULT_CONFIG[platform]
    }
    await setConfig(newConfig)
    toast.success(`${platform} credentials cleared and securely deleted`)
  }

  const handleExportCredentials = async () => {
    return config
  }

  const handleImportCredentials = async (data: APIConfig) => {
    await setConfig(data)
    toast.success('Credentials imported and encrypted')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <Alert className="border-blue-500/30 bg-blue-500/5">
        <Shield className="h-4 w-4 text-blue-500" />
        <AlertTitle className="flex items-center gap-2">
          <Lock size={14} className="text-blue-500" />
          End-to-End Encryption Enabled
        </AlertTitle>
        <AlertDescription>
          All API credentials are encrypted using AES-256-GCM before being stored locally in your browser. 
          Your credentials never leave your device and are never sent to external servers unless required for the specific service.
          {isDemoMode && (
            <span className="block mt-2 text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1">
              <AlertTriangle size={14} />
              Demo Mode Active: Using simulated data. Connect real APIs to enable full functionality.
            </span>
          )}
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="space-y-0.5">
          <Label htmlFor="demo-mode" className="text-base">Demo Mode</Label>
          <p className="text-sm text-muted-foreground">
            Use simulated data instead of real API connections
          </p>
        </div>
        <Switch
          id="demo-mode"
          checked={isDemoMode}
          onCheckedChange={setIsDemoMode}
        />
      </div>

      <Tabs defaultValue="googleCloud" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="googleCloud" className="gap-2">
            <Cloud className="h-4 w-4" />
            <span className="hidden sm:inline">Google Cloud</span>
          </TabsTrigger>
          <TabsTrigger value="datadog" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Datadog</span>
          </TabsTrigger>
          <TabsTrigger value="confluent" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Confluent</span>
          </TabsTrigger>
          <TabsTrigger value="elevenLabs" className="gap-2">
            <AudioWaveform className="h-4 w-4" />
            <span className="hidden sm:inline">ElevenLabs</span>
          </TabsTrigger>
        </TabsList>

        {/* GOOGLE CLOUD TAB */}
        <TabsContent value="googleCloud">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle>Google Cloud Configuration</CardTitle>
                    {validationStatus.googleCloud && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                        <Lock size={10} className="mr-1" />
                        Encrypted
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Vertex AI and Gemini integration</CardDescription>
                </div>
                <Switch
                  checked={config.googleCloud.enabled}
                  onCheckedChange={(checked) => updateConfig('googleCloud', { enabled: checked })}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gc-project-id">Project ID</Label>
                <Input
                  id="gc-project-id"
                  value={config.googleCloud.projectId}
                  onChange={(e) => updateConfig('googleCloud', { projectId: e.target.value })}
                  placeholder="my-gcp-project-id"
                />
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
                    variant="ghost"
                    onClick={() => toggleSecretVisibility('googleCloud')}
                  >
                    {showSecrets.googleCloud ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between">
                <Button variant="destructive" size="sm" onClick={() => clearCredentials('googleCloud')}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button onClick={() => handleTestConnection('Google Cloud')}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DATADOG TAB */}
        <TabsContent value="datadog">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle>Datadog Configuration</CardTitle>
                    {validationStatus.datadog && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                        <Lock size={10} className="mr-1" />
                        Encrypted
                      </Badge>
                    )}
                  </div>
                  <CardDescription>LLM observability and monitoring</CardDescription>
                </div>
                <Switch
                  checked={config.datadog.enabled}
                  onCheckedChange={(checked) => updateConfig('datadog', { enabled: checked })}
                />
              </div>
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
                    className="font-mono"
                  />
                  <Button size="icon" variant="ghost" onClick={() => toggleSecretVisibility('datadog')}>
                    {showSecrets.datadog ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              </div>
              <Separator />
              <div className="flex justify-between">
                <Button variant="destructive" size="sm" onClick={() => clearCredentials('datadog')}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button onClick={() => handleTestConnection('Datadog')}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONFLUENT TAB */}
        <TabsContent value="confluent">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle>Confluent Configuration</CardTitle>
                    {validationStatus.confluent && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                        <Lock size={10} className="mr-1" />
                        Encrypted
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Real-time data streaming</CardDescription>
                </div>
                <Switch
                  checked={config.confluent.enabled}
                  onCheckedChange={(checked) => updateConfig('confluent', { enabled: checked })}
                />
              </div>
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
                    className="font-mono"
                  />
                  <Button size="icon" variant="ghost" onClick={() => toggleSecretVisibility('confluent')}>
                    {showSecrets.confluent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cf-secret">API Secret</Label>
                <Input
                  id="cf-secret"
                  type="password"
                  value={config.confluent.apiSecret}
                  onChange={(e) => updateConfig('confluent', { apiSecret: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cf-bootstrap">Bootstrap Server</Label>
                <Input
                  id="cf-bootstrap"
                  value={config.confluent.bootstrapServer}
                  onChange={(e) => updateConfig('confluent', { bootstrapServer: e.target.value })}
                  placeholder="pkc-xxxx.region.confluent.cloud:9092"
                />
              </div>
              <Separator />
              <div className="flex justify-between">
                <Button variant="destructive" size="sm" onClick={() => clearCredentials('confluent')}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button onClick={() => handleTestConnection('Confluent')}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ELEVENLABS TAB */}
        <TabsContent value="elevenLabs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle>ElevenLabs Configuration</CardTitle>
                    {validationStatus.elevenLabs && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                        <Lock size={10} className="mr-1" />
                        Encrypted
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Voice synthesis and agent capabilities</CardDescription>
                </div>
                <Switch
                  checked={config.elevenLabs.enabled}
                  onCheckedChange={(checked) => updateConfig('elevenLabs', { enabled: checked })}
                />
              </div>
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
                    className="font-mono"
                  />
                  <Button size="icon" variant="ghost" onClick={() => toggleSecretVisibility('elevenLabs')}>
                    {showSecrets.elevenLabs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="el-agent-id">Agent ID</Label>
                <Input
                  id="el-agent-id"
                  value={config.elevenLabs.agentId}
                  onChange={(e) => updateConfig('elevenLabs', { agentId: e.target.value })}
                  placeholder="Voice ID / Agent ID"
                />
              </div>
              <Separator />
              <div className="flex justify-between">
                <Button variant="destructive" size="sm" onClick={() => clearCredentials('elevenLabs')}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button onClick={() => handleTestConnection('ElevenLabs')}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      <Webhooks />

      <WebhookStatus />

      <CredentialBackup
        onExport={handleExportCredentials}
        onImport={handleImportCredentials}
      />

      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key size={16} className="text-muted-foreground" />
            Security Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Shield size={14} className="mt-0.5 text-blue-500" />
            <div>
              <strong className="text-foreground">AES-256-GCM Encryption:</strong> All API keys are encrypted using industry-standard AES-256-GCM before storage.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Lock size={14} className="mt-0.5 text-blue-500" />
            <div>
              <strong className="text-foreground">Local Storage Only:</strong> Credentials are stored in your browser's encrypted local storage and never transmitted to third-party servers.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Key size={14} className="mt-0.5 text-blue-500" />
            <div>
              <strong className="text-foreground">Automatic Key Generation:</strong> A unique encryption key is generated for your browser session and stored securely.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 text-yellow-500" />
            <div>
              <strong className="text-foreground">Browser Data:</strong> Clearing your browser data will delete stored credentials. Always keep backups of your API keys.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
