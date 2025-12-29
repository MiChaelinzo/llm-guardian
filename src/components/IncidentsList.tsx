import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bug, CheckCircle, Clock, FilePdf, ChatCircle } from '@phosphor-icons/react'
import { formatTimestamp } from '@/lib/metrics'
import type { Incident, FileAttachment } from '@/lib/types'
import { motion } from 'framer-motion'
import { exportIncidentToPDF } from '@/lib/pdf-export'
import { toast } from 'sonner'
import { IncidentDetailDialog } from './IncidentDetailDialog'

interface IncidentsListProps {
  incidents: Incident[]
  onResolve: (incidentId: string) => void
  onAddAttachment: (incidentId: string, file: FileAttachment) => void
  onRemoveAttachment: (incidentId: string, fileId: string) => void
  currentUserId?: string
  currentUserName?: string
  currentUserAvatar?: string
}

export function IncidentsList({ 
  incidents, 
  onResolve,
  onAddAttachment,
  onRemoveAttachment,
  currentUserId = 'user_default',
  currentUserName = 'User',
  currentUserAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
}: IncidentsListProps) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  
  const safeIncidents = Array.isArray(incidents) ? incidents : []
  const openIncidents = safeIncidents.filter(i => i.status !== 'resolved')
  const resolvedIncidents = safeIncidents.filter(i => i.status === 'resolved').slice(-5)

  const handleExportIncident = (incident: Incident) => {
    try {
      exportIncidentToPDF(incident)
      toast.success('Incident exported to PDF', {
        description: 'Your download should start automatically'
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to export incident')
    }
  }

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
        return 'border-destructive'
      case 'warning':
        return 'border-warning'
      default:
        return 'border-primary'
    }
  }

  if (openIncidents.length === 0 && resolvedIncidents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-success" weight="fill" />
        <h3 className="text-xl font-semibold mb-2">No Incidents</h3>
        <p className="text-muted-foreground">No incidents have been created yet</p>
      </Card>
    )
  }

  return (
    <>
      <IncidentDetailDialog
        incident={selectedIncident}
        open={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onResolve={(id) => {
          onResolve(id)
          setSelectedIncident(null)
        }}
        onAddAttachment={onAddAttachment}
        onRemoveAttachment={onRemoveAttachment}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
      />

      <div className="space-y-6">
        {openIncidents.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bug size={20} weight="fill" className="text-destructive" />
              <h3 className="font-semibold">Open Incidents</h3>
              <Badge variant="secondary">{openIncidents.length}</Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Datadog
              </Badge>
            </div>
            
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {openIncidents.map((incident) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border-l-4 bg-card ${getSeverityColor(incident.severity)} shadow-sm`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{incident.title}</h4>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                          <Badge variant="outline">{incident.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{incident.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatTimestamp(incident.createdAt)}
                          </div>
                          {incident.alerts && incident.alerts.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Bug size={14} />
                              {incident.alerts.length} alert{incident.alerts.length > 1 ? 's' : ''}
                            </div>
                          )}
                          {incident.attachments && incident.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FilePdf size={14} />
                              {incident.attachments.length} file{incident.attachments.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedIncident(incident)}
                        >
                          <ChatCircle size={16} className="mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportIncident(incident)}
                        >
                          <FilePdf size={16} className="mr-1" />
                          Export
                        </Button>
                        {incident.status !== 'resolved' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onResolve(incident.id)}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}

        {resolvedIncidents.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} weight="fill" className="text-success" />
              <h3 className="font-semibold">Recently Resolved</h3>
              <Badge variant="secondary">{resolvedIncidents.length}</Badge>
            </div>
            
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {resolvedIncidents.map((incident) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-lg border bg-card/50 opacity-75"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{incident.title}</h4>
                          <Badge className={getStatusColor(incident.status)} variant="outline">
                            {incident.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{incident.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            Resolved {formatTimestamp(incident.resolvedAt || incident.createdAt)}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        View
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </>
  )
}
