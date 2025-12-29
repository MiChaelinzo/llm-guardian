import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  X, 
  CheckCircle, 
  Clock, 
  Bug, 
  Lightning, 
  ChatCircle,
  ListChecks,
  ChartBar 
} from '@phosphor-icons/react'
import { IncidentChat } from './IncidentChat'
import { formatDistanceToNow } from 'date-fns'
import type { Incident } from '@/lib/types'

interface IncidentDetailDialogProps {
  incident: Incident | null
  open: boolean
  onClose: () => void
  onResolve: (incidentId: string) => void
  currentUserId: string
  currentUserName: string
  currentUserAvatar: string
}

export function IncidentDetailDialog({
  incident,
  open,
  onClose,
  onResolve,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: IncidentDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!incident) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive'
      case 'warning':
        return 'text-warning'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-success text-success-foreground'
      case 'investigating':
        return 'bg-warning text-warning-foreground'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle size={16} weight="fill" />
      case 'investigating':
        return <Clock size={16} weight="fill" />
      default:
        return <Bug size={16} weight="fill" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-3">
                <Bug size={28} weight="bold" className={getSeverityColor(incident.severity)} />
                {incident.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {incident.description}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Badge className={getStatusColor(incident.status)}>
              {getStatusIcon(incident.status)}
              <span className="ml-1.5">{incident.status.toUpperCase()}</span>
            </Badge>
            <Badge variant="outline" className={getSeverityColor(incident.severity)}>
              <Lightning size={14} weight="fill" />
              <span className="ml-1">{incident.severity.toUpperCase()}</span>
            </Badge>
            <span className="text-xs text-muted-foreground">
              Created {formatDistanceToNow(incident.createdAt, { addSuffix: true })}
            </span>
            {incident.resolvedAt && (
              <span className="text-xs text-success">
                Resolved {formatDistanceToNow(incident.resolvedAt, { addSuffix: true })}
              </span>
            )}
          </div>
        </DialogHeader>

        <Separator />

        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList>
              <TabsTrigger value="overview" className="gap-2">
                <ListChecks size={16} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-2">
                <ChatCircle size={16} />
                Team Chat
              </TabsTrigger>
              <TabsTrigger value="metrics" className="gap-2">
                <ChartBar size={16} />
                Related Metrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Associated Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-3">
                      {incident.alerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start justify-between p-3 rounded-lg bg-muted/50 border border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <span className="text-sm font-medium">{alert.ruleName}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{alert.message}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                              <span>Value: {alert.value.toFixed(2)}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                            </div>
                          </div>
                          {alert.acknowledged && (
                            <CheckCircle size={18} weight="fill" className="text-success flex-shrink-0 ml-2" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {incident.aiSuggestion && (
                <Card className="border-accent/30 bg-accent/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightning size={18} weight="fill" className="text-accent" />
                      AI Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{incident.aiSuggestion}</p>
                  </CardContent>
                </Card>
              )}

              {incident.status !== 'resolved' && (
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => onResolve(incident.id)}
                    className="gap-2"
                  >
                    <CheckCircle size={18} weight="fill" />
                    Mark as Resolved
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chat" className="mt-4">
              <IncidentChat
                incident={incident}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                currentUserAvatar={currentUserAvatar}
              />
            </TabsContent>

            <TabsContent value="metrics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Incident Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Incident Created</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(incident.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {incident.status === 'investigating' && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-warning"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Investigation Started</p>
                          <p className="text-xs text-muted-foreground">In progress</p>
                        </div>
                      </div>
                    )}
                    {incident.resolvedAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-success"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Incident Resolved</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(incident.resolvedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
