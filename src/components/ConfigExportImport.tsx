import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Download, Upload, FileCode, CheckCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { DetectionRule, SLO, WebhookConfig, NotificationPreference } from '@/lib/types'

interface ConfigExportImportProps {
  rules: DetectionRule[]
  slos: SLO[]
  webhooks: WebhookConfig[]
  preferences: NotificationPreference
  onImport: (config: {
    rules?: DetectionRule[]
    slos?: SLO[]
    webhooks?: WebhookConfig[]
    preferences?: NotificationPreference
  }) => void
}

interface ExportConfig {
  version: string
  exportedAt: number
  rules: DetectionRule[]
  slos: SLO[]
  webhooks: WebhookConfig[]
  preferences: NotificationPreference
}

export function ConfigExportImport({ 
  rules, 
  slos, 
  webhooks, 
  preferences, 
  onImport 
}: ConfigExportImportProps) {
  const [importText, setImportText] = useState('')
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null)

  const handleExport = () => {
    const config: ExportConfig = {
      version: '1.0',
      exportedAt: Date.now(),
      rules,
      slos,
      webhooks: webhooks.map(w => ({ ...w, url: '***REDACTED***' })),
      preferences,
    }

    const jsonString = JSON.stringify(config, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `voicewatch-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Configuration exported successfully')
  }

  const validateConfig = (text: string): { valid: boolean; message: string; config?: ExportConfig } => {
    try {
      const config = JSON.parse(text) as ExportConfig

      if (!config.version) {
        return { valid: false, message: 'Invalid config: missing version' }
      }

      if (!Array.isArray(config.rules)) {
        return { valid: false, message: 'Invalid config: rules must be an array' }
      }

      if (config.webhooks && config.webhooks.some(w => w.url === '***REDACTED***')) {
        return { 
          valid: true, 
          message: 'Valid config (webhook URLs were redacted and need to be reconfigured)',
          config 
        }
      }

      return { valid: true, message: 'Valid configuration', config }
    } catch (error) {
      return { valid: false, message: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }

  const handleValidate = () => {
    const result = validateConfig(importText)
    setValidationResult(result)
  }

  const handleImport = () => {
    const result = validateConfig(importText)
    
    if (!result.valid || !result.config) {
      toast.error(result.message)
      return
    }

    const newRules = result.config.rules.map(r => ({
      ...r,
      id: `rule_${Date.now()}_${Math.random()}`,
    }))

    const newSLOs = result.config.slos?.map(s => ({
      ...s,
      id: `slo_${Date.now()}_${Math.random()}`,
    })) || []

    const newWebhooks = result.config.webhooks?.filter(w => w.url !== '***REDACTED***').map(w => ({
      ...w,
      id: `webhook_${Date.now()}_${Math.random()}`,
    })) || []

    onImport({
      rules: newRules,
      slos: newSLOs,
      webhooks: newWebhooks,
      preferences: result.config.preferences,
    })

    toast.success(`Imported ${newRules.length} rules, ${newSLOs.length} SLOs, ${newWebhooks.length} webhooks`)
    setImportText('')
    setValidationResult(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setImportText(text)
      const result = validateConfig(text)
      setValidationResult(result)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Configuration Export / Import</h2>
        <p className="text-muted-foreground">
          Share detection rules, SLOs, and settings across teams or backup your configuration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} weight="fill" />
            Export Configuration
          </CardTitle>
          <CardDescription>
            Download your current configuration as JSON (webhook URLs are redacted for security)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-2xl font-bold">{rules.length}</div>
              <div className="text-sm text-muted-foreground">Detection Rules</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{slos.length}</div>
              <div className="text-sm text-muted-foreground">SLOs</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{webhooks.length}</div>
              <div className="text-sm text-muted-foreground">Webhooks</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Object.values(preferences.channels).filter(Boolean).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Channels</div>
            </div>
          </div>
          <Button onClick={handleExport} className="w-full gap-2">
            <Download size={18} weight="bold" />
            Export Configuration
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} weight="fill" />
            Import Configuration
          </CardTitle>
          <CardDescription>
            Upload or paste a configuration file to import settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="config-file">Upload JSON File</Label>
            <input
              id="config-file"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config-json">Or Paste JSON</Label>
            <Textarea
              id="config-json"
              placeholder="Paste configuration JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={10}
              className="font-mono text-xs"
            />
          </div>

          {validationResult && (
            <div 
              className={`flex items-start gap-3 p-3 rounded-lg ${
                validationResult.valid 
                  ? 'bg-success/10 border border-success/20' 
                  : 'bg-destructive/10 border border-destructive/20'
              }`}
            >
              {validationResult.valid ? (
                <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" weight="fill" />
              ) : (
                <Warning size={20} className="text-destructive flex-shrink-0 mt-0.5" weight="fill" />
              )}
              <div className="flex-1">
                <div className={`text-sm font-medium ${validationResult.valid ? 'text-success' : 'text-destructive'}`}>
                  {validationResult.valid ? 'Valid Configuration' : 'Invalid Configuration'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {validationResult.message}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleValidate} 
              disabled={!importText}
              className="gap-2"
            >
              <FileCode size={18} />
              Validate
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!validationResult?.valid}
              className="flex-1 gap-2"
            >
              <Upload size={18} weight="bold" />
              Import Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
