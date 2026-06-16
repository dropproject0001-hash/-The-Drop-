/**
 * SECURE STORAGE UTILITY
 * Provides AES-GCM encrypted storage for sensitive data in the browser.
 * Uses the Web Crypto API (SubtleCrypto) for hardware-accelerated encryption.
 */
import { env } from './env';

const STORAGE_PREFIX = 'the-drop-secure-';
const DEFAULT_SALT = 'the-drop-tactical-salt-2026';

/**
 * Derived key for encryption
 */
let memoizedKey: CryptoKey | null = null;

async function getEncryptionKey(): Promise<CryptoKey> {
  if (memoizedKey) return memoizedKey;

  // Key derivation parameters
  const baseSecret = env.CRYPTO_SECRET || 'THE-DROP-SECURE-STORAGE-DEFAULT-SECRET';
  const salt = env.SECURE_STORAGE_SALT || DEFAULT_SALT;

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(baseSecret),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  memoizedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  return memoizedKey;
}

export const secureStorage = {
  /**
   * Encrypt and store a value
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const cryptoKey = await getEncryptionKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();

      const encryptedContent = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encoder.encode(value)
      );

      const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedContent), iv.length);

      const base64 = btoa(String.fromCharCode(...combined));
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, base64);
    } catch (error) {
      console.error('[SecureStorage] Encryption failed:', error);
      throw error;
    }
  },

  /**
   * Retrieve and decrypt a value
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const base64 = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!base64) return null;

      const combined = new Uint8Array(
        atob(base64)
          .split('')
          .map((c) => c.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encryptedContent = combined.slice(12);

      const cryptoKey = await getEncryptionKey();
      const decryptedContent = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encryptedContent
      );

      return new TextDecoder().decode(decryptedContent);
    } catch (error) {
      console.error('[SecureStorage] Decryption failed:', error);
      return null;
    }
  },

  /**
   * Remove an item
   */
  removeItem(key: string): void {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  },

  /**
   * Clear all secure items
   */
  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },

  /**
   * Store unencrypted public data (e.g., UI preferences)
   */
  setPublicItem(key: string, value: string): void {
    localStorage.setItem(`public-${key}`, value);
  },

  getPublicItem(key: string): string | null {
    return localStorage.getItem(`public-${key}`);
  }
};
