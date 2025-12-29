import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Camera, Download, Check, X, MonitorPlay, Image as ImageIcon, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  captureScreenshot, 
  captureElement, 
  downloadScreenshot, 
  createAttachmentFromScreenshot, 
  formatFileSize, 
  type ScreenshotResult 
} from '@/lib/screenshot-capture'
import type { FileAttachment } from '@/lib/types'

interface ScreenshotCaptureProps {
  onCapture: (attachment: FileAttachment) => void
  userId: string
  userName: string
  autoCapture?: boolean
  captureMode?: 'full' | 'visible' | 'element'
}

export function ScreenshotCapture({ 
  onCapture, 
  userId, 
  userName, 
  autoCapture = false, 
  captureMode = 'visible' 
}: ScreenshotCaptureProps) {
  const [capturing, setCapturing] = useState(false)
  const [preview, setPreview] = useState<ScreenshotResult | null>(null)
  const [mode, setMode] = useState<'full' | 'visible' | 'element'>(captureMode)
  const [fullPage, setFullPage] = useState(false)
  const [elementSelector, setElementSelector] = useState('.container')
  const [autoDownload, setAutoDownload] = useState(false)

  const handleCapture = async () => {
    setCapturing(true)
    try {
      let screenshot: ScreenshotResult

      if (mode === 'element' && elementSelector) {
        screenshot = await captureElement(elementSelector)
      } else {
        screenshot = await captureScreenshot({
          fullPage: mode === 'full' || fullPage,
        })
      }

      setPreview(screenshot)
      toast.success('Screenshot captured successfully!')

      if (autoDownload) {
        const filename = `voicewatch-screenshot-${Date.now()}.png`
        await downloadScreenshot(screenshot, filename)
      }
    } catch (error) {
      console.error('Capture error:', error)
      toast.error('Failed to capture screenshot')
    } finally {
      setCapturing(false)
    }
  }

  const handleSave = () => {
    if (!preview) return

    const attachment = createAttachmentFromScreenshot(
      preview,
      userId,
      userName,
      `incident-screenshot-${Date.now()}.png`
    )

    onCapture(attachment)
    toast.success('Screenshot attached to incident')
    setPreview(null)
  }

  const handleDownload = async () => {
    if (!preview) return
    const filename = `voicewatch-screenshot-${Date.now()}.png`
    await downloadScreenshot(preview, filename)
    toast.success('Screenshot downloaded')
  }

  const handleDiscard = () => {
    setPreview(null)
    toast.info('Screenshot discarded')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera size={20} className="text-primary" />
          Screenshot Capture
        </CardTitle>
        <CardDescription>
          Capture screenshots for incident documentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!preview ? (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="capture-mode">Capture Mode</Label>
                <Select value={mode} onValueChange={(value) => setMode(value as any)}>
                  <SelectTrigger id="capture-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">
                      <div className="flex items-center gap-2">
                        <MonitorPlay size={16} />
                        Visible Area
                      </div>
                    </SelectItem>
                    <SelectItem value="full">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={16} />
                        Full Page
                      </div>
                    </SelectItem>
                    <SelectItem value="element">
                      <div className="flex items-center gap-2">
                        <Lightning size={16} />
                        Specific Element
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode === 'element' && (
                <div className="space-y-2">
                  <Label htmlFor="element-selector">CSS Selector</Label>
                  <Input
                    id="element-selector"
                    value={elementSelector}
                    onChange={(e) => setElementSelector(e.target.value)}
                    placeholder=".container, #main, etc."
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a CSS selector to target a specific element
                  </p>
                </div>
              )}

              {mode === 'visible' && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="full-page" className="flex-1">
                    Capture full scrollable page
                  </Label>
                  <Switch
                    id="full-page"
                    checked={fullPage}
                    onCheckedChange={setFullPage}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-download" className="flex-1">
                  Auto-download after capture
                </Label>
                <Switch
                  id="auto-download"
                  checked={autoDownload}
                  onCheckedChange={setAutoDownload}
                />
              </div>
            </div>

            <Button
              onClick={handleCapture}
              disabled={capturing}
              className="w-full"
              size="lg"
            >
              {capturing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Camera size={20} />
                  </motion.div>
                  Capturing...
                </>
              ) : (
                <>
                  <Camera size={20} />
                  Capture Screenshot
                </>
              )}
            </Button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="relative rounded-lg overflow-hidden border-2 border-primary/20 bg-muted">
              <img
                src={preview.dataUrl}
                alt="Screenshot preview"
                className="w-full h-auto"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  {preview.width} × {preview.height}
                </Badge>
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  {formatFileSize(preview.size)}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleSave}
                className="flex-1"
                size="lg"
              >
                <Check size={20} />
                Attach to Incident
              </Button>
              <Button
                onClick={handleDownload}
                variant="secondary"
                className="flex-1"
                size="lg"
              >
                <Download size={20} />
                Download
              </Button>
              <Button
                onClick={handleDiscard}
                variant="outline"
                size="lg"
              >
                <X size={20} />
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
