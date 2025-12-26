import { useState, useEffect, useCallback } from 'react'
import { encryptData, decryptData } from '@/lib/encryption'

export function useSecureStorage<T>(key: string, defaultValue: T): [T, (value: T) => Promise<void>, () => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSecureData = async () => {
      try {
        const stored = localStorage.getItem(`secure_${key}`)
        if (stored) {
          const decrypted = await decryptData(stored)
          setValue(JSON.parse(decrypted))
        }
      } catch (error) {
        console.error('Failed to load secure data:', error)
        setValue(defaultValue)
      } finally {
        setIsLoading(false)
      }
    }

    loadSecureData()
  }, [key, defaultValue])

  const setSecureValue = useCallback(async (newValue: T) => {
    try {
      const jsonString = JSON.stringify(newValue)
      const encrypted = await encryptData(jsonString)
      localStorage.setItem(`secure_${key}`, encrypted)
      setValue(newValue)
    } catch (error) {
      console.error('Failed to save secure data:', error)
      throw error
    }
  }, [key])

  const deleteSecureValue = useCallback(async () => {
    try {
      localStorage.removeItem(`secure_${key}`)
      setValue(defaultValue)
    } catch (error) {
      console.error('Failed to delete secure data:', error)
      throw error
    }
  }, [key, defaultValue])

  return [value, setSecureValue, deleteSecureValue]
}
