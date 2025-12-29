import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, X, File, Image, FileText } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FileAttachment } from '@/lib/types'

interface FileUploadProps {
  onUpload: (file: FileAttachment) => void
  onRemove: (fileId: string) => void
  attachments: FileAttachment[]
  currentUserId: string
  currentUserName: string
  maxSizeMB?: number
  allowedTypes?: string[]
}

export function FileUpload({
  onUpload,
  onRemove,
  attachments,
  currentUserId,
  currentUserName,
  maxSizeMB = 10,
  allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'text/plain', 'application/json', 'text/csv']
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type not allowed: ${file.name}`)
        continue
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max ${maxSizeMB}MB)`)
        continue
      }

      try {
        const dataUrl = await readFileAsDataUrl(file)
        const attachment: FileAttachment = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          uploadedAt: Date.now(),
          uploadedBy: currentUserId,
          uploadedByName: currentUserName
        }

        onUpload(attachment)
        toast.success(`Uploaded: ${file.name}`)
      } catch (error) {
        toast.error(`Failed to upload: ${file.name}`)
        console.error('File upload error:', error)
      }
    }

    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image size={20} weight="fill" className="text-primary" />
    if (type.includes('text') || type.includes('json') || type.includes('csv')) {
      return <FileText size={20} weight="fill" className="text-accent" />
    }
    return <File size={20} weight="fill" className="text-muted-foreground" />
  }

  const downloadFile = (attachment: FileAttachment) => {
    const link = document.createElement('a')
    link.href = attachment.dataUrl
    link.download = attachment.name
    link.click()
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 bg-card'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload size={24} weight="bold" className="text-primary" />
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">
              Drop files here or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline"
                disabled={isUploading}
              >
                browse
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              Images, logs, and text files up to {maxSizeMB}MB
            </p>
          </div>

          {isUploading && (
            <div className="text-xs text-primary animate-pulse">Uploading...</div>
          )}
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Attachments ({attachments.length})
          </h4>
          <AnimatePresence>
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(attachment.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {attachment.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>{formatFileSize(attachment.size)}</span>
                              <span>•</span>
                              <span>{attachment.uploadedByName}</span>
                              <span>•</span>
                              <span>
                                {new Date(attachment.uploadedAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFile(attachment)}
                              className="h-7 w-7 p-0"
                            >
                              <Upload size={14} className="rotate-180" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemove(attachment.id)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>

                        {attachment.type.startsWith('image/') && (
                          <div className="mt-2">
                            <img
                              src={attachment.dataUrl}
                              alt={attachment.name}
                              className="max-w-full h-auto max-h-48 rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(attachment.dataUrl, '_blank')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
