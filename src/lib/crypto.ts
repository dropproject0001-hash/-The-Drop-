import CryptoJS from 'crypto-js';
import { supabase } from './supabase';

/**
 * SECURE CRYPTO UTILITY
 * Fetches the encryption key from the database at runtime.
 * Removes hardcoded secrets from the source code.
 */

let memoizedKey: string | null = null;
let keyFetchPromise: Promise<string | null> | null = null;

/**
 * INTERNAL USE ONLY: Resets the memoized key state.
 * Used for unit testing to ensure fresh key fetch logic is exercised.
 */
export function _resetCryptoState(): void {
  memoizedKey = null;
  keyFetchPromise = null;
}

/**
 * Fetches the crypto secret from app_settings table
 */
async function getCryptoSecret(): Promise<string | null> {
  if (memoizedKey) return memoizedKey;
  if (keyFetchPromise) return keyFetchPromise;

  keyFetchPromise = (async () => {
    try {
      // First check environment variable (for local dev override)
      const envKey = import.meta.env.VITE_CRYPTO_SECRET;
      if (envKey && envKey.length >= 32) {
        memoizedKey = envKey;
        return envKey;
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'crypto_secret_key')
        .single();

      if (error || !data) {
        console.warn('[Crypto] Encryption key not found in database or unauthorized. Fallback to plaintext.');
        return null;
      }

      memoizedKey = data.value;
      return data.value;
    } catch (err) {
      console.error('[Crypto] Failed to fetch encryption key:', err);
      return null;
    } finally {
      keyFetchPromise = null;
    }
  })();

  return keyFetchPromise;
}

/**
 * Encrypts a note asynchronously using the fetched key
 */
export async function encryptNote(note: string): Promise<string> {
  if (!note) return '';

  const key = await getCryptoSecret();
  if (!key) {
    console.warn('[Crypto] Encryption skipped: No key available.');
    return note;
  }

  try {
    return CryptoJS.AES.encrypt(note, key).toString();
  } catch (err) {
    console.error('[Crypto] Encryption failed:', err);
    return note;
  }
}

/**
 * Decrypts a note asynchronously
 */
export async function decryptNote(encryptedBase64: string): Promise<string> {
  if (!encryptedBase64) return '';

  const key = await getCryptoSecret();
  if (!key) {
    return '[Encryption Key Not Available]';
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedBase64, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    // If originalText is empty but input was not, it's a decryption failure
    if (!originalText && encryptedBase64) {
      return '[Decryption Failed]';
    }

    return originalText;
  } catch (err) {
    console.error('[Crypto] Decryption failed:', err);
    return '[Decryption Failed]';
  }
}

/**
 * Checks if encryption is available
 */
export async function isEncryptionAvailable(): Promise<boolean> {
  const key = await getCryptoSecret();
  return !!key;
}
