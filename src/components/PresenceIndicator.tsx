import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCollaboration } from '@/hooks/use-collaboration'
import { Users } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface PresenceIndicatorProps {
  userId: string
}

export function PresenceIndicator({ userId }: PresenceIndicatorProps) {
  const { users, isConnected } = useCollaboration(userId)
  const activeUsers = users.filter(u => u.id !== userId && u.status === 'active')

  if (!isConnected || activeUsers.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg shadow-sm">
        <Users size={18} weight="bold" className="text-primary" />
        <div className="flex -space-x-2">
          {activeUsers.slice(0, 3).map((user, index) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Avatar className="w-8 h-8 border-2 border-card hover:z-10 transition-all hover:scale-110 cursor-pointer">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">Active now</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        {activeUsers.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{activeUsers.length - 3}
          </Badge>
        )}
        <span className="text-sm text-muted-foreground ml-1">
          {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
        </span>
      </div>
    </TooltipProvider>
  )
}
