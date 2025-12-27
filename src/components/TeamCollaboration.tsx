import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Users, Eye, Pulse } from '@phosphor-icons/react'

interface TeamActivity {
  userId: string
  userName: string
  userAvatar: string
  action: string
  timestamp: number
  isActive: boolean
}

export function TeamCollaboration() {
  const [currentUser, setCurrentUser] = useState<{login: string; avatarUrl: string} | null>(null)
  const [activeViewers, setActiveViewers] = useState<TeamActivity[]>([])
  const [recentActivity, setRecentActivity] = useState<TeamActivity[]>([])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await window.spark.user()
        if (user && user.login) {
          setCurrentUser({ login: user.login, avatarUrl: user.avatarUrl })
          
          addActivity({
            userId: user.id.toString(),
            userName: user.login,
            userAvatar: user.avatarUrl,
            action: 'Viewing dashboard',
            timestamp: Date.now(),
            isActive: true
          })
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const simulateTeamActivity = () => {
      const actions = [
        'Acknowledged alert',
        'Created detection rule',
        'Resolved incident',
        'Exported PDF report',
        'Updated webhook config',
        'Analyzed metrics',
        'Tested webhook endpoint'
      ]
      
      const teamMembers = [
        { name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
        { name: 'Marcus Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
        { name: 'Aisha Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha' },
        { name: 'Chen Wei', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen' }
      ]

      const member = teamMembers[Math.floor(Math.random() * teamMembers.length)]
      const action = actions[Math.floor(Math.random() * actions.length)]
      
      addActivity({
        userId: `simulated-${Math.random()}`,
        userName: member.name,
        userAvatar: member.avatar,
        action,
        timestamp: Date.now(),
        isActive: Math.random() > 0.5
      })
    }

    const interval = setInterval(simulateTeamActivity, 15000)
    return () => clearInterval(interval)
  }, [])

  const addActivity = (activity: TeamActivity) => {
    setRecentActivity(prev => {
      const updated = [activity, ...prev].slice(0, 8)
      return updated
    })

    if (activity.isActive) {
      setActiveViewers(prev => {
        const filtered = prev.filter(v => v.userId !== activity.userId)
        return [...filtered, activity].slice(-5)
      })
      
      setTimeout(() => {
        setActiveViewers(prev => prev.filter(v => v.userId !== activity.userId))
      }, 60000)
    }
  }

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Team Collaboration</h3>
            <p className="text-sm text-muted-foreground">Real-time activity across your organization</p>
          </div>
        </div>
        {activeViewers.length > 0 && (
          <Badge variant="outline" className="gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            {activeViewers.length} online
          </Badge>
        )}
      </div>

      {activeViewers.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Currently Active</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              {activeViewers.map((viewer) => (
                <Tooltip key={viewer.userId}>
                  <TooltipTrigger>
                    <div className="relative">
                      <Avatar className="w-9 h-9 border-2 border-background">
                        <AvatarImage src={viewer.userAvatar} alt={viewer.userName} />
                        <AvatarFallback>{viewer.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{viewer.userName}</p>
                    <p className="text-xs text-muted-foreground">{viewer.action}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
            {currentUser && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="relative">
                      <Avatar className="w-9 h-9 border-2 border-primary">
                        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.login} />
                        <AvatarFallback>{currentUser.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{currentUser.login} (You)</p>
                    <p className="text-xs text-muted-foreground">Viewing dashboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Pulse size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Recent Team Activity</span>
        </div>
        <div className="space-y-3">
          {recentActivity.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
          {recentActivity.map((activity, idx) => (
            <div
              key={`${activity.userId}-${activity.timestamp}-${idx}`}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                <AvatarFallback>{activity.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.userName}</span>
                  {' '}
                  <span className="text-muted-foreground">{activity.action.toLowerCase()}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Users size={18} className="text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Enterprise Team Features</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enable real-time collaboration with role-based access control, shared dashboards, 
              and synchronized alert management across your organization. Perfect for DevOps teams, 
              SREs, and AI engineering groups working on production LLM systems.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
