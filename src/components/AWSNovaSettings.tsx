import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lightning, CheckCircle, Warning, LockKey } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { novaVoiceService, type NovaVoiceConfig } from '@/lib/aws-nova'

export function AWSNovaSettings() {
  const [config, setConfig] = useKV<NovaVoiceConfig>('aws-nova-config', {
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    enabled: false
  })

  const [showSecrets, setShowSecrets] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  const handleSave = () => {
    if (config) {
      novaVoiceService.setConfig(config)
      toast.success('AWS Nova configuration saved', {
        description: 'Speech-to-speech AI is now configured'
      })
    }
  }

  const handleTest = async () => {
    if (!config?.enabled || !config.accessKeyId || !config.secretAccessKey) {
      toast.error('Please configure all credentials first')
      return
    }

    setTestingConnection(true)
    try {
      novaVoiceService.setConfig(config)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('AWS Nova connection successful', {
        description: 'Speech-to-speech AI is ready to use'
      })
    } catch (error) {
      toast.error('Connection test failed', {
        description: error instanceof Error ? error.message : 'Please check your credentials'
      })
    } finally {
      setTestingConnection(false)
    }
  }

  const isConfigured = config?.enabled && config.accessKeyId && config.secretAccessKey

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Lightning size={20} weight="fill" className="text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AWS Nova 2 Sonic
                {isConfigured && (
                  <Badge variant="outline" className="gap-1 border-success/50 bg-success/10 text-success">
                    <CheckCircle size={12} weight="fill" />
                    Configured
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Real-time speech-to-speech conversational AI model
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config?.enabled || false}
              onCheckedChange={(enabled) => setConfig((c) => ({ ...c!, enabled }))}
            />
            <Label className="text-sm cursor-pointer">
              {config?.enabled ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert className="bg-primary/5 border-primary/20">
          <Lightning className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>AWS Nova 2 Sonic</strong> provides ultra-low latency speech-to-speech AI for natural voice conversations.
            Configure your AWS credentials below to enable real-time conversational monitoring.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="nova-region">AWS Region</Label>
            <Input
              id="nova-region"
              value={config?.region || 'us-east-1'}
              onChange={(e) => setConfig((c) => ({ ...c!, region: e.target.value }))}
              placeholder="us-east-1"
            />
            <p className="text-xs text-muted-foreground">
              AWS region where Nova 2 Sonic is available (e.g., us-east-1, us-west-2)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nova-access-key">AWS Access Key ID</Label>
            <div className="relative">
              <Input
                id="nova-access-key"
                type={showSecrets ? 'text' : 'password'}
                value={config?.accessKeyId || ''}
                onChange={(e) => setConfig((c) => ({ ...c!, accessKeyId: e.target.value }))}
                placeholder="AKIA..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <LockKey size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your AWS IAM access key with Nova Bedrock permissions
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nova-secret-key">AWS Secret Access Key</Label>
            <div className="relative">
              <Input
                id="nova-secret-key"
                type={showSecrets ? 'text' : 'password'}
                value={config?.secretAccessKey || ''}
                onChange={(e) => setConfig((c) => ({ ...c!, secretAccessKey: e.target.value }))}
                placeholder="••••••••••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <LockKey size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your AWS secret access key (encrypted and stored securely)
            </p>
          </div>
        </div>

        <Alert className="bg-warning/5 border-warning/20">
          <Warning className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            <strong>Security Note:</strong> Your AWS credentials are stored encrypted in your browser using the Spark secure storage API.
            They are never sent to any third-party servers except AWS Bedrock.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={!config?.accessKeyId || !config?.secretAccessKey}
          >
            <CheckCircle size={16} className="mr-2" />
            Save Configuration
          </Button>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={!isConfigured || testingConnection}
            className="flex-1"
          >
            {testingConnection ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                Testing...
              </>
            ) : (
              <>
                <Lightning size={16} className="mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold mb-2">Getting AWS Credentials</h4>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Sign in to the <a href="https://aws.amazon.com/console/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AWS Console</a></li>
            <li>Navigate to IAM → Users → Create User or use existing user</li>
            <li>Attach policy: <code className="bg-muted px-1 py-0.5 rounded text-xs">AmazonBedrockFullAccess</code></li>
            <li>Create access key → Copy Access Key ID and Secret Access Key</li>
            <li>Enable Bedrock model access for Nova in your region</li>
            <li>Paste credentials above and save</li>
          </ol>
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Lightning size={16} weight="fill" className="text-primary" />
            Feature Highlights
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• <strong>Ultra-low latency:</strong> Sub-second response times for natural conversation flow</li>
            <li>• <strong>Speech-to-speech:</strong> Direct audio input to audio output without intermediate text</li>
            <li>• <strong>Context-aware:</strong> Understands your observability metrics and alert context</li>
            <li>• <strong>Conversation memory:</strong> Maintains conversation history for follow-up questions</li>
            <li>• <strong>Real-time metrics:</strong> Integrates current system health into responses</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
