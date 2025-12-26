import { useState, useEffect, useCallback } from 'react'
// Fix: Import 'encrypt' and 'decrypt' (aliased if you prefer maintaining the name)
import { encrypt, decrypt } from '@/lib/encryption'

export function useSecureStorage<T>(
  key: string, 
  defaultValue: T
): [T, (value: T) => Promise<void>, () => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue)
  // Removed unused 'isLoading' state to fix linter error/return type mismatch

  useEffect(() => {
    let isMounted = true

    const loadSecureData = async () => {
      try {
        const stored = localStorage.getItem(`secure_${key}`)
        if (stored && isMounted) {
          // Fix: Use 'decrypt' instead of 'decryptData'
          const decrypted = await decrypt(stored)
          setValue(JSON.parse(decrypted))
        }
      } catch (error) {
        console.error('Failed to load secure data:', error)
        if (isMounted) setValue(defaultValue)
      }
    }

    loadSecureData()

    return () => {
      isMounted = false
    }
  }, [key, defaultValue])

  const setSecureValue = useCallback(async (newValue: T) => {
    try {
      const jsonString = JSON.stringify(newValue)
      // Fix: Use 'encrypt' instead of 'encryptData'
      const encrypted = await encrypt(jsonString)
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




