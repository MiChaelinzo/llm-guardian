import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Camera } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { captureScreenshot, createAttachmentFromScreenshot } from '@/lib/screenshot-capture'
import type { FileAttachment } from '@/lib/types'

interface QuickCaptureButtonProps {
  onCapture: (attachment: FileAttachment) => void
  userId: string
  userName: string
  incidentId?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function QuickCaptureButton({
  onCapture,
  userId,
  userName,
  incidentId,
  variant = 'outline',
  size = 'sm',
  className,
}: QuickCaptureButtonProps) {
  const [capturing, setCapturing] = useState(false)

  const handleQuickCapture = async () => {
    if (!userId || !userName) {
      toast.error('User information not available')
      return
    }

    setCapturing(true)
    try {
      const screenshot = await captureScreenshot({
        fullPage: false,
      })

      const filename = incidentId 
        ? `incident-${incidentId}-${Date.now()}.png`
        : `quick-capture-${Date.now()}.png`

      const attachment = createAttachmentFromScreenshot(
        screenshot,
        userId,
        userName,
        filename
      )

      onCapture(attachment)
      
      toast.success('Screenshot captured!', {
        description: 'Added to incident attachments',
      })
    } catch (error) {
      console.error('Quick capture error:', error)
      toast.error('Failed to capture screenshot')
    } finally {
      setCapturing(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleQuickCapture}
      disabled={capturing}
      className={className}
    >
      {capturing ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Camera size={16} />
        </motion.div>
      ) : (
        <Camera size={16} />
      )}
      {size !== 'icon' && (
        <span className="ml-1.5">{capturing ? 'Capturing...' : 'Quick Capture'}</span>
      )}
    </Button>
  )
}
