/**
 * cryptoApiKey — Web (Next.js)
 * Chiffrement AES-256-GCM + dérivation PBKDF2 via Web Crypto API native.
 * La clé ne peut être déchiffrée qu'avec le PIN de l'utilisateur.
 */

async function deriveKey(pin: string, userId: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(userId),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    raw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function fromBase64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), c => c.charCodeAt(0))
}

export async function encryptApiKey(
  plaintext: string,
  pin: string,
  userId: string,
): Promise<{ enc: string; iv: string; hint: string }> {
  const key = await deriveKey(pin, userId)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const buf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  )
  return {
    enc: toBase64(buf),
    iv: toBase64(iv),
    hint: '...' + plaintext.slice(-4),
  }
}

export async function decryptApiKey(
  enc: string,
  iv: string,
  pin: string,
  userId: string,
): Promise<string> {
  const key = await deriveKey(pin, userId)
  const buf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(iv) as BufferSource },
    key,
    fromBase64(enc) as BufferSource,
  )
  return new TextDecoder().decode(buf)
}
