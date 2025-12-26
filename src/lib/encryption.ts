const ENCRYPTION_KEY_NAME = 'voicewatch-encryption-key'
const SALT_LENGTH = 16
const KEY_LENGTH = 256
const IV_LENGTH = 12
const ITERATIONS = 100000

async function getEncryptionKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME)
  
  if (storedKey) {
    const keyData = JSON.parse(storedKey)
    return await crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: 'AES-GCM', length: KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    )
  }

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )

  const exportedKey = await crypto.subtle.exportKey('jwk', key)
  localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey))

  return key
}

async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function encryptData(plaintext: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)
    
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    const encryptedArray = new Uint8Array(encryptedData)
    const combined = new Uint8Array(iv.length + encryptedArray.length)
    combined.set(iv)
    combined.set(encryptedArray, iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export async function decryptData(ciphertext: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const combined = new Uint8Array(
      atob(ciphertext).split('').map(c => c.charCodeAt(0))
    )

    const iv = combined.slice(0, IV_LENGTH)
    const data = combined.slice(IV_LENGTH)

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
    
    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

export async function encryptWithPassword(plaintext: string, password: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)
    
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    const key = await deriveKeyFromPassword(password, salt)
    
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
    
    const encryptedArray = new Uint8Array(encryptedData)
    const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length)
    combined.set(salt)
    combined.set(iv, salt.length)
    combined.set(encryptedArray, salt.length + iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Password encryption error:', error)
    throw new Error('Failed to encrypt with password')
  }
}

export async function decryptWithPassword(ciphertext: string, password: string): Promise<string> {
  try {
    const combined = new Uint8Array(
      atob(ciphertext).split('').map(c => c.charCodeAt(0))
    )

    const salt = combined.slice(0, SALT_LENGTH)
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const data = combined.slice(SALT_LENGTH + IV_LENGTH)

    const key = await deriveKeyFromPassword(password, salt)
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  } catch (error) {
    console.error('Password decryption error:', error)
    throw new Error('Failed to decrypt with password')
  }
}

export function hashSecret(secret: string): string {
  let hash = 0
  for (let i = 0; i < secret.length; i++) {
    const char = secret.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

export function maskSecret(secret: string, visibleChars: number = 4): string {
  if (!secret || secret.length === 0) return ''
  
  const visible = Math.min(visibleChars, Math.floor(secret.length / 2))
  return secret.slice(0, visible) + '•'.repeat(secret.length - visible)
}

export function validateApiKey(key: string, prefix?: string): boolean {
  if (!key || key.trim().length === 0) return false
  if (prefix && !key.startsWith(prefix)) return false
  return true
}

export async function secureDelete(key: string): Promise<void> {
  try {
    localStorage.removeItem(key)
    localStorage.removeItem(`secure_${key}`)
  } catch (error) {
    console.error('Secure delete error:', error)
  }
}

export async function testEncryption(): Promise<boolean> {
  try {
    const testData = 'test-encryption-data'
    const encrypted = await encryptData(testData)
    const decrypted = await decryptData(encrypted)
    return testData === decrypted
  } catch (error) {
    return false
  }
}
