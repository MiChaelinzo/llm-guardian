import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChatCircle, Users, Bell } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { IncidentChat } from './IncidentChat'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import type { Incident, ChatChannel } from '@/lib/types'

interface TeamChatPanelProps {
  incidents: Incident[]
  currentUserId: string
  currentUserName: string
  currentUserAvatar: string
}

export function TeamChatPanel({ incidents, currentUserId, currentUserName, currentUserAvatar }: TeamChatPanelProps) {
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null)
  const [channels] = useKV<Record<string, ChatChannel>>('chat-channels', {})

  const openIncidents = incidents.filter(i => i.status !== 'resolved')
  const activeIncident = openIncidents.find(i => i.id === activeIncidentId)

  if (openIncidents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ChatCircle size={48} className="mx-auto mb-4 text-muted-foreground" weight="fill" />
          <h3 className="text-lg font-semibold mb-2">No Active Incidents</h3>
          <p className="text-sm text-muted-foreground">
            Team chat becomes available when incidents are open
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!activeIncident) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChatCircle size={20} weight="bold" className="text-primary" />
            Team Chat
          </CardTitle>
          <CardDescription>Select an incident to start chatting with your team</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {openIncidents.map((incident) => {
                const channel = channels?.[`chat-channel-${incident.id}`]
                const hasUnread = channel?.unreadCount && channel.unreadCount > 0

                return (
                  <Button
                    key={incident.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => setActiveIncidentId(incident.id)}
                  >
                    <div className="flex items-start gap-3 flex-1 text-left">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <ChatCircle size={20} weight="fill" className="text-primary-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{incident.title}</span>
                          {hasUnread && (
                            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px]">
                              {channel.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {incident.description}
                        </p>
                        {channel?.lastMessageAt && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Last message {formatDistanceToNow(channel.lastMessageAt, { addSuffix: true })}
                          </p>
                        )}
                      </div>
                      {channel?.participantIds && channel.participantIds.length > 1 && (
                        <Badge variant="secondary" className="flex-shrink-0 text-[10px] h-5 gap-1">
                          <Users size={10} />
                          {channel.participantIds.length}
                        </Badge>
                      )}
                    </div>
                  </Button>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setActiveIncidentId(null)}
        className="gap-2"
      >
        ← Back to Incident List
      </Button>
      <IncidentChat
        incident={activeIncident}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
      />
    </div>
  )
}
