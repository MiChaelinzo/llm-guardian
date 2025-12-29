import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bug, CheckCircle, Clock, X, FilePdf, ChatCircle } from '@phosphor-icons/react'
import { formatTimestamp } from '@/lib/metrics'
import type { Incident, FileAttachment } from '@/lib/types'
import { IncidentChat } from './IncidentChat'
import { FileUpload } from './FileUpload'
import { motion } from 'framer-motion'

interface IncidentDetailDialogProps {
  incident: Incident | null
  open: boolean
  onClose: () => void
  onResolve: (incidentId: string) => void
  onAddAttachment: (incidentId: string, file: FileAttachment) => void
  onRemoveAttachment: (incidentId: string, fileId: string) => void
  currentUserId?: string
  currentUserName?: string
  currentUserAvatar?: string
}

export function IncidentDetailDialog({
  incident,
  open,
  onClose,
  onResolve,
  onAddAttachment,
  onRemoveAttachment,
  currentUserId = 'user_default',
  currentUserName = 'User',
  currentUserAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
}: IncidentDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('details')

  if (!incident) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-destructive text-destructive-foreground'
      case 'investigating':
        return 'bg-warning text-warning-foreground'
      case 'resolved':
        return 'bg-success text-success-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive'
      case 'warning':
        return 'text-warning'
      default:
        return 'text-primary'
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                <Bug size={20} weight="fill" className={getSeverityColor(incident.severity)} />
                {incident.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {incident.description}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(incident.status)}>
                {incident.status}
              </Badge>
              <Badge variant="outline">{incident.severity}</Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="chat">
              <ChatCircle size={16} className="mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="files">
              <FilePdf size={16} className="mr-1" />
              Files ({incident.attachments?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-auto space-y-4 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Created</div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTimestamp(incident.createdAt)}
                    </div>
                  </div>
                  {incident.resolvedAt && (
                    <div>
                      <div className="text-muted-foreground mb-1">Resolved</div>
                      <div className="flex items-center gap-1">
                        <CheckCircle size={14} />
                        {formatTimestamp(incident.resolvedAt)}
                      </div>
                    </div>
                  )}
                </div>

                {incident.aiSuggestion && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="font-semibold mb-2 text-sm">AI Suggestion</div>
                    <p className="text-sm text-muted-foreground">{incident.aiSuggestion}</p>
                  </div>
                )}

                {incident.alerts && incident.alerts.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2 text-sm">Related Alerts ({incident.alerts.length})</div>
                    <div className="space-y-2">
                      {incident.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="p-3 rounded-lg border bg-card text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{alert.ruleName}</span>
                            <Badge variant="outline" className="text-xs">
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTimestamp(alert.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {incident.status !== 'resolved' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => onResolve(incident.id)}
                      className="flex-1"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Resolve Incident
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 overflow-hidden mt-4">
            <IncidentChat
              incident={incident}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
            />
          </TabsContent>

          <TabsContent value="files" className="flex-1 overflow-auto space-y-4 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                <FileUpload
                  onUpload={(file) => onAddAttachment(incident.id, file)}
                  onRemove={(fileId) => onRemoveAttachment(incident.id, fileId)}
                  attachments={incident.attachments || []}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
