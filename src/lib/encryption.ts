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

  // Generate a new key if none exists or import failed
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

    // Combine IV and Encrypted Data
    const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)

    // Convert to Base64
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
    
    // Convert Base64 back to Uint8Array
    const binaryString = atob(encryptedText)
    const combined = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i)
    }

    // Extract IV and Ciphertext
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
    hash = hash & hash // Convert to 32bit integer
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
 * Tests the encryption/decryption flow to ensure the environment supports it.
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



