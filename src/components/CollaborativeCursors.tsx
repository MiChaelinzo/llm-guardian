import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCollaboration } from '@/hooks/use-collaboration'

interface CollaborativeCursorsProps {
  userId: string
}

export function CollaborativeCursors({ userId }: CollaborativeCursorsProps) {
  const { users, updateCursor } = useCollaboration(userId)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateCursor(e.clientX, e.clientY)
    }

    const throttledMouseMove = throttle(handleMouseMove, 100)
    window.addEventListener('mousemove', throttledMouseMove)

    return () => {
      window.removeEventListener('mousemove', throttledMouseMove)
    }
  }, [updateCursor])

  const otherUsers = users.filter(u => u.id !== userId && u.cursorPosition)

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {otherUsers.map((user) => {
          if (!user.cursorPosition) return null

          const colors = [
            'rgb(99, 102, 241)',
            'rgb(168, 85, 247)',
            'rgb(236, 72, 153)',
            'rgb(249, 115, 22)',
            'rgb(34, 197, 94)',
          ]
          const color = colors[parseInt(user.id.slice(-1), 36) % colors.length]

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: user.cursorPosition.x,
                y: user.cursorPosition.y,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.65376 12.3673L11.6538 20.3673C11.8151 20.5946 12.0696 20.7391 12.3504 20.7621C12.6312 20.7851 12.9075 20.6847 13.1053 20.4869L15.6369 17.9553L18.8906 19.5821C19.1396 19.7071 19.4295 19.7071 19.6785 19.5821L21.4285 18.7071C21.6775 18.5821 21.8571 18.3504 21.9179 18.0754L22.9179 13.0754C22.9785 12.8004 22.9143 12.5121 22.7429 12.2912L16.7429 4.29121C16.5715 4.07034 16.3143 3.94121 16.0429 3.94121H5.04289C4.76789 3.94121 4.51076 4.07034 4.33933 4.29121C4.16789 4.51208 4.10358 4.80042 4.16433 5.07542L5.16433 10.0754C5.22508 10.3504 5.40476 10.5821 5.65376 10.7071L8.90751 12.3339L6.37608 14.8653C6.17829 15.0631 6.07787 15.3394 6.10089 15.6202C6.12391 15.901 6.26846 16.1555 6.49576 16.3168L14.4958 22.3168C14.7231 22.4781 15.0141 22.5206 15.2792 22.4336C15.5444 22.3466 15.7576 22.1391 15.8626 21.8673L17.3626 18.3673"
                  fill={color}
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
              <div
                className="absolute left-6 top-0 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
                style={{ backgroundColor: color }}
              >
                {user.name}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastExecTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const currentTime = Date.now()

    if (currentTime - lastExecTime < delay) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        lastExecTime = currentTime
        func.apply(this, args)
      }, delay - (currentTime - lastExecTime))
    } else {
      lastExecTime = currentTime
      func.apply(this, args)
    }
  }
}
