const ENCRYPTION_KEY_NAME = 'voicewatch-encryption-key'
const KEY_LENGTH = 256
const IV_LENGTH = 12

/**
 * Retrieves the encryption key from localStorage or generates a new one.
 * The key is stored as a JWK (JSON Web Key).
 */
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

/**
 * Encrypts a string using AES-GCM.
 * Returns a Base64 encoded string containing the IV and Ciphertext.
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

    const encryptedArray = new Uint8Array(encrypted)
    const combined = new Uint8Array(iv.length + encryptedArray.length)
    combined.set(iv)
    combined.set(encryptedArray, iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypts a Base64 encoded string using AES-GCM.
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
 * Creates a simple hash of a secret (useful for non-secure ID generation).
 */
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

/**
 * Masks a secret string for display (e.g., "AIza...").
 */
export function maskSecret(secret: string, visible = 4): string {
  if (!secret) return ''
  if (secret.length <= visible) return secret
  return secret.slice(0, visible) + '•'.repeat(Math.min(secret.length - visible, 20))
}

/**
 * Validates that a key is present and not empty.
 */
export function validateKey(key: string): boolean {
  if (!key || key.trim().length === 0) return false
  return true
}

/**
 * Tests the encryption/decryption functionality.
 */
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

/**
 * Derives a cryptographic key from a password using PBKDF2.
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts a string using a password-derived key (PBKDF2 + AES-GCM).
 * Returns a Base64 encoded string containing the Salt, IV, and Ciphertext.
 */
export async function encryptWithPassword(text: string, password: string): Promise<string> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    const key = await deriveKeyFromPassword(password, salt)
    const encoder = new TextEncoder()
    const data = encoder.encode(text)

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    const encryptedArray = new Uint8Array(encrypted)
    const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length)
    combined.set(salt)
    combined.set(iv, salt.length)
    combined.set(encryptedArray, salt.length + iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Password encryption error:', error)
    throw new Error('Failed to encrypt data with password')
  }
}

/**
 * Decrypts a Base64 encoded string using a password-derived key (PBKDF2 + AES-GCM).
 */
export async function decryptWithPassword(encryptedText: string, password: string): Promise<string> {
  try {
    const binaryString = atob(encryptedText)
    const combined = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i)
    }

    const salt = combined.slice(0, 16)
    const iv = combined.slice(16, 16 + IV_LENGTH)
    const data = combined.slice(16 + IV_LENGTH)

    const key = await deriveKeyFromPassword(password, salt)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Password decryption error:', error)
    throw new Error('Failed to decrypt data with password')
  }
}
