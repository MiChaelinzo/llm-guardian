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
  const openIncidents = incidents.filter(i => i.status !== 'resolved')
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').slice(-5)

  const handleExportIncident = (incident: Incident) => {
    try {
      exportIncidentToPDF(incident)
      toast.success('Incident exported to PDF', {
        description: 'Your download should start automatically'
      })
    } catch (error) {
      toast.error('Failed to export incident')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-destructive'
      case 'investigating':
        return 'bg-warning'
      case 'resolved':
        return 'bg-success'
      default:
        return 'bg-muted'
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
              <span className="w-1.5 h-1.5 rounded-full bg-cost" />
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
                  className={`p-4 rounded-lg border-l-4 bg-card ${getSeverityColor(incident.severity)}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{incident.title}</h4>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                        <Badge variant="outline">{incident.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{incident.description}</p>
                    </div>
                  </div>
                  
                  {incident.aiSuggestion && (
                    <div className="bg-muted/50 rounded p-3 mb-3">
                      <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                        <span className="text-primary">AI Recommendation</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{incident.aiSuggestion}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={14} />
                      <span className="font-mono">{formatTimestamp(incident.createdAt)}</span>
                      <span>•</span>
                      <span>{incident.alerts.length} alert{incident.alerts.length !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedIncident(incident)}
                        className="text-xs h-7 gap-1"
                      >
                        <ChatCircle size={14} weight="fill" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleExportIncident(incident)}
                        className="text-xs h-7 gap-1"
                      >
                        <FilePdf size={14} weight="fill" />
                        Export
                      </Button>
                      {incident.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onResolve(incident.id)}
                          className="text-xs h-7"
                        >
                          Start Investigation
                        </Button>
                      )}
                      {incident.status === 'investigating' && (
                        <Button
                          size="sm"
                          onClick={() => onResolve(incident.id)}
                          className="text-xs h-7"
                        >
                          Mark Resolved
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
          </div>
          
          <div className="space-y-3">
            {resolvedIncidents.map((incident) => (
              <div
                key={incident.id}
                className="p-3 rounded-lg bg-muted/30 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{incident.title}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatTimestamp(incident.resolvedAt || incident.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
    </>
  )
}
