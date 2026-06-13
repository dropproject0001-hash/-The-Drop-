import CryptoJS from 'crypto-js';
import { env } from './env';

const SECRET_KEY = env.ENCRYPTION_KEY || 'THE-DROP-FALLBACK-SECRET';

/**
 * Simple AES encryption for chat notes and messages
 * Synchronous to match simple field ops requirements
 */
export function encryptNote(note: string): string {
  if (!note) return '';
  return CryptoJS.AES.encrypt(note, SECRET_KEY).toString();
}

export function decryptNote(encryptedBase64: string): string {
  if (!encryptedBase64) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedBase64, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || '[Encrypted]';
  } catch (err) {
    console.error('Decryption failed', err);
    return '[Decryption Failed]';
  }
}
