import { Shield, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface EncryptionStatusProps {
  hasEncryptedCredentials: boolean
}

export function EncryptionStatus({ hasEncryptedCredentials }: EncryptionStatusProps) {
  if (!hasEncryptedCredentials) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="bg-success/10 text-success border-success/30 cursor-help"
          >
            <Shield size={12} className="mr-1" />
            <Lock size={10} className="mr-1" />
            Encrypted
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">Credentials Protected</p>
            <p className="text-xs text-muted-foreground">
              Your API keys are encrypted with AES-256-GCM and stored securely in your browser.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
