/**
 * Crypto Service (Legacy/Placeholder)
 *
 * Note: Symmetric encryption with a hardcoded key in the client bundle
 * provided no actual security against database breaches or MITM attacks.
 * We now rely on Row Level Security (RLS) and TLS for transport security.
 *
 * For future E2E encryption, the Web Crypto API should be used with
 * device-stored private keys.
 */

export function encryptNote(note: string): string {
  // Now returning plaintext. RLS ensures only authorized parties see this.
  return note || '';
}

export function decryptNote(encryptedBase64: string): string {
  // Now returning plaintext.
  return encryptedBase64 || '';
}
