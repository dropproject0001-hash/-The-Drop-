/**
 * AES-GCM Implementation for end-to-end encryption of drop notes
 * 
 * WHY: Drop details (like codes or instructions) can be sensitive. 
 * We derive an AES-256-GCM key from the user's JWT sub (unique ID) so 
 * the server only holds ciphertext. The key never leaves the client.
 */

export async function generateKey(secret: string, salt: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // PBKDF2 with 100,000 iterations for secure key derivation
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptNote(note: string, key: CryptoKey): Promise<string> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(note)
  );
  
  // Combine IV and Ciphertext into a single payload
  const payload = new Uint8Array(iv.length + ciphertext.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(ciphertext), iv.length);
  
  // Convert to Base64 for database storage
  return btoa(String.fromCharCode(...payload));
}

export async function decryptNote(encryptedBase64: string, key: CryptoKey): Promise<string> {
  const payloadStr = atob(encryptedBase64);
  const payload = new Uint8Array(payloadStr.length);
  for (let i = 0; i < payloadStr.length; i++) {
    payload[i] = payloadStr.charCodeAt(i);
  }
  
  const iv = payload.slice(0, 12);
  const data = payload.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return new TextDecoder().decode(decrypted);
}
