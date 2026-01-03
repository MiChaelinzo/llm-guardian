import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useCollaboration } from '@/hooks/use-collaboration'
import { Users, Circle, ChartLine } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface RealtimeCollaborationProps {
  userId: string
  userName: string
}

export function RealtimeCollaboration({ userId, userName }: RealtimeCollaborationProps) {
  const { users, events, isConnected } = useCollaboration(userId)
  const [recentEvents, setRecentEvents] = useState(events.slice(-10))

  useEffect(() => {
    setRecentEvents(events.slice(-10).reverse())
  }, [events])

  const activeUsers = users.filter(u => u.status === 'active')

  const getEventDescription = (event: typeof events[0]) => {
    const user = users.find(u => u.id === event.userId)
    const userName = user?.name || 'Unknown user'

    switch (event.type) {
      case 'user_joined':
        return `${userName} joined the session`
      case 'user_left':
        return `${userName} left the session`
      case 'alert_acknowledged':
        return `${userName} acknowledged an alert`
      case 'rule_created':
        return `${userName} created rule "${event.ruleName}"`
      case 'rule_updated':
        return `${userName} updated rule "${event.ruleName}"`
      case 'incident_resolved':
        return `${userName} resolved an incident`
      case 'metric_viewed':
        return `${userName} viewed ${event.metricName} metrics`
      case 'comment_added':
        return `${userName} added a comment`
      case 'cursor_move':
        return `${userName} is active`
      case 'presence_update':
        return `${userName} is now ${event.status}`
      default:
        return 'Activity detected'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'user_joined':
      case 'user_left':
        return <Users size={16} weight="fill" />
      case 'alert_acknowledged':
      case 'incident_resolved':
        return <Circle size={16} weight="fill" className="text-success" />
      default:
        return <ChartLine size={16} weight="fill" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success'
      case 'idle':
        return 'bg-warning'
      case 'away':
        return 'bg-muted-foreground'
      default:
        return 'bg-muted'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={24} weight="bold" className="text-primary" />
          <h3 className="text-lg font-semibold">Live Collaboration</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'} animate-pulse`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium">Active Users</span>
            <Badge variant="secondary" className="text-xs">
              {activeUsers.length} online
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {activeUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative"
                >
                  <Avatar className="w-10 h-10 border-2 border-card hover:border-primary transition-colors cursor-pointer">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(user.status)}`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {activeUsers.length === 0 && (
              <div className="text-sm text-muted-foreground py-2">
                No other users online
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-3">
            <ChartLine size={18} weight="bold" className="text-accent" />
            <span className="text-sm font-medium">Recent Activity</span>
          </div>
          <ScrollArea className="h-[240px] pr-4">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {recentEvents.map((event, index) => {
                  const user = users.find(u => u.id === event.userId)
                  return (
                    <motion.div
                      key={`${event.timestamp}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {user && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="text-xs">
                            {user.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {!user && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {getEventIcon(event.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          {getEventDescription(event)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {recentEvents.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No recent activity
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </Card>
  )
}
