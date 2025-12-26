const ENCRYPTION_KEY_NAME = 'voicewatch-encryption-key'
const KEY_LENGTH = 256
const IV_LENGTH = 12
const SALT_LENGTH = 16
const ITERATIONS = 100000

// --- INTERNAL HELPERS ---

async function deriveKeyFromPassword(password: string, salt: Uint8Array, usages: KeyUsage[]): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    usages
  )
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME)

  if (storedKey) {
    try {
      const keyData = JSON.parse(storedKey)
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM', length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
      )
    } catch (error) {
      console.error('Failed to import stored key, generating new one:', error)
    }
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

// --- EXPORTED FUNCTIONS ---

/**
 * Encrypts data using the browser-local key (for settings persistence).
 */
export async function encrypt(text: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    const encoder = new TextEncoder()
    const data = encoder.encode(text)

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypts data using the browser-local key.
 */
export async function decrypt(encryptedText: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const binaryString = atob(encryptedText)
    const combined = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i)
    }

    const iv = combined.slice(0, IV_LENGTH)
    const data = combined.slice(IV_LENGTH)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Encrypts data using a user-provided password (for backups).
 */
export async function encryptWithPassword(text: string, password: string): Promise<string> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    
    const key = await deriveKeyFromPassword(password, salt, ['encrypt'])
    const encoder = new TextEncoder()
    const data = encoder.encode(text)

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    const encryptedArray = new Uint8Array(encrypted)
    const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length)
    
    combined.set(salt, 0)
    combined.set(iv, SALT_LENGTH)
    combined.set(encryptedArray, SALT_LENGTH + IV_LENGTH)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Password encryption error:', error)
    throw new Error('Failed to encrypt with password')
  }
}

/**
 * Decrypts data using a user-provided password (for backups).
 */
export async function decryptWithPassword(encryptedText: string, password: string): Promise<string> {
  try {
    const binaryString = atob(encryptedText)
    const combined = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i)
    }

    const salt = combined.slice(0, SALT_LENGTH)
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const data = combined.slice(SALT_LENGTH + IV_LENGTH)

    const key = await deriveKeyFromPassword(password, salt, ['decrypt'])

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Password decryption error:', error)
    throw new Error('Invalid password or corrupted file')
  }
}

export function hashSecret(secret: string): string {
  let hash = 0
  if (secret.length === 0) return hash.toString()
  
  for (let i = 0; i < secret.length; i++) {
    const char = secret.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

export function maskSecret(secret: string, visible = 4): string {
  if (!secret) return ''
  if (secret.length <= visible) return secret
  return secret.slice(0, visible) + '•'.repeat(Math.min(secret.length - visible, 20))
}

export function validateKey(key: string): boolean {
  if (!key || key.trim().length === 0) return false
  return true
}

export async function testEncryption(): Promise<boolean> {
  try {
    const testData = 'test-encryption-data'
    const encrypted = await encrypt(testData)
    const decrypted = await decrypt(encrypted)
    return testData === decrypted
  } catch (error) {
    console.error('Encryption test failed:', error)
    return false
  }
}
