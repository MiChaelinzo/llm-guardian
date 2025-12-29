import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera, CheckCircle, Warning, Info } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface AutoCaptureSettings {
  enabled: boolean
  captureMode: 'visible' | 'full'
  captureDelay: number
  captureOnAlertCreation: boolean
  captureOnIncidentCreation: boolean
  maxCapturesPerIncident: number
}

const defaultSettings: AutoCaptureSettings = {
  enabled: false,
  captureMode: 'visible',
  captureDelay: 1000,
  captureOnAlertCreation: false,
  captureOnIncidentCreation: true,
  maxCapturesPerIncident: 3,
}

export function AutoCaptureSettings() {
  const [settings, setSettings] = useKV<AutoCaptureSettings>('auto-capture-settings', defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  const updateSetting = <K extends keyof AutoCaptureSettings>(
    key: K,
    value: AutoCaptureSettings[K]
  ) => {
    setSettings((current) => ({
      ...(current || defaultSettings),
      [key]: value,
    }))
    setHasChanges(true)
  }

  useEffect(() => {
    if (hasChanges) {
      const timer = setTimeout(() => {
        toast.success('Auto-capture settings saved')
        setHasChanges(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [hasChanges])

  const currentSettings = settings || defaultSettings

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera size={20} className="text-primary" />
          Automatic Screenshot Capture
          {currentSettings.enabled && (
            <Badge variant="default" className="ml-2">
              <CheckCircle size={14} className="mr-1" />
              Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Configure automatic screenshot capture for incidents and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="space-y-1">
              <Label htmlFor="auto-capture-enabled" className="text-base font-semibold">
                Enable Auto-Capture
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically capture screenshots when incidents or alerts are created
              </p>
            </div>
            <Switch
              id="auto-capture-enabled"
              checked={currentSettings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
          </div>

          {currentSettings.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pl-4 border-l-2 border-primary/30"
            >
              <div className="space-y-2">
                <Label htmlFor="capture-mode">Capture Mode</Label>
                <Select
                  value={currentSettings.captureMode}
                  onValueChange={(value) => updateSetting('captureMode', value as 'visible' | 'full')}
                >
                  <SelectTrigger id="capture-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">Visible Area Only</SelectItem>
                    <SelectItem value="full">Full Page Scroll</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose whether to capture only the visible area or the entire scrollable page
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capture-delay">Capture Delay (ms)</Label>
                <Select
                  value={currentSettings.captureDelay.toString()}
                  onValueChange={(value) => updateSetting('captureDelay', parseInt(value))}
                >
                  <SelectTrigger id="capture-delay">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Immediate</SelectItem>
                    <SelectItem value="500">500ms</SelectItem>
                    <SelectItem value="1000">1 second</SelectItem>
                    <SelectItem value="2000">2 seconds</SelectItem>
                    <SelectItem value="3000">3 seconds</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Delay before capturing to allow UI elements to settle
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="capture-alert">Capture on Alert Creation</Label>
                    <p className="text-xs text-muted-foreground">
                      Capture when new alerts are generated
                    </p>
                  </div>
                  <Switch
                    id="capture-alert"
                    checked={currentSettings.captureOnAlertCreation}
                    onCheckedChange={(checked) => updateSetting('captureOnAlertCreation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="capture-incident">Capture on Incident Creation</Label>
                    <p className="text-xs text-muted-foreground">
                      Capture when incidents are created from alerts
                    </p>
                  </div>
                  <Switch
                    id="capture-incident"
                    checked={currentSettings.captureOnIncidentCreation}
                    onCheckedChange={(checked) => updateSetting('captureOnIncidentCreation', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-captures">Max Captures per Incident</Label>
                <Select
                  value={currentSettings.maxCapturesPerIncident.toString()}
                  onValueChange={(value) => updateSetting('maxCapturesPerIncident', parseInt(value))}
                >
                  <SelectTrigger id="max-captures">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 screenshot</SelectItem>
                    <SelectItem value="3">3 screenshots</SelectItem>
                    <SelectItem value="5">5 screenshots</SelectItem>
                    <SelectItem value="10">10 screenshots</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Limit the number of automatic captures per incident to manage storage
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                <Info size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Auto-capture Tips</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Screenshots are captured automatically in the background</li>
                    <li>They are attached to incidents for documentation</li>
                    <li>Use a delay to ensure UI elements are fully loaded</li>
                    <li>Full page capture may take longer on complex pages</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-2 bg-success/10 rounded-lg border border-success/20"
          >
            <CheckCircle size={16} className="text-success" />
            <span className="text-sm text-success-foreground">Settings saved automatically</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
