import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'

export interface AuthUser {
  id: string
  login: string
  name: string
  email: string
  avatarUrl: string
  isOwner: boolean
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasCheckedAuth, setHasCheckedAuth] = useKV<boolean>('has-checked-auth', false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true)
        const sparkUser = await window.spark.user()
        
        const authUser: AuthUser = {
          id: sparkUser.id,
          login: sparkUser.login,
          name: sparkUser.login,
          email: sparkUser.email || '',
          avatarUrl: sparkUser.avatarUrl,
          isOwner: sparkUser.isOwner,
        }

        setUser(authUser)
        setIsAuthenticated(true)
        setHasCheckedAuth(true)
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [setHasCheckedAuth])

  const login = async () => {
    try {
      setIsLoading(true)
      const sparkUser = await window.spark.user()
      
      const authUser: AuthUser = {
        id: sparkUser.id,
        login: sparkUser.login,
        name: sparkUser.login,
        email: sparkUser.email || '',
        avatarUrl: sparkUser.avatarUrl,
        isOwner: sparkUser.isOwner,
      }

      setUser(authUser)
      setIsAuthenticated(true)
      setHasCheckedAuth(true)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setUser(null)
    setIsAuthenticated(false)
    setHasCheckedAuth(false)
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    hasCheckedAuth,
    login,
    logout,
  }
}
