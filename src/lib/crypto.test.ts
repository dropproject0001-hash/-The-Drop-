import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encryptNote, decryptNote, isEncryptionAvailable, _resetMemoizedKey } from './crypto';
import { supabase } from './supabase';

// Mock supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { value: 'DB_SECURE_KEY_FOR_TESTING_PURPOSES_ONLY' }, error: null })),
        })),
      })),
    })),
  },
}));

describe('crypto.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetMemoizedKey();
    vi.stubEnv('VITE_CRYPTO_SECRET', 'TEST_CRYPTO_SECRET_KEY_MIN_32_CHARS_LONG');
  });

  it('should encrypt and decrypt a note correctly', async () => {
    const originalNote = 'Tactical payload at sector 7';
    const encrypted = await encryptNote(originalNote);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(originalNote);

    const decrypted = await decryptNote(encrypted);
    expect(decrypted).toBe(originalNote);
  });

  it('should return original note if note is empty', async () => {
    expect(await encryptNote('')).toBe('');
    expect(await decryptNote('')).toBe('');
  });

  it('should handle encryption availability check', async () => {
    const available = await isEncryptionAvailable();
    expect(available).toBe(true);
  });

  it('should return [Encrypted] if decryption produces empty string (invalid data)', async () => {
    const result = await decryptNote('invalid-encrypted-data');
    expect(result).toBe('[Encrypted]');
  });

  it('should return fallback if key is not available', async () => {
    // Force no key
    vi.stubEnv('VITE_CRYPTO_SECRET', '');
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: 'Unauthorized' })),
        })),
      })),
    } as any);

    const note = 'Secret message';
    const encrypted = await encryptNote(note);
    expect(encrypted).toBe(note); // Fallback to plaintext

    const decrypted = await decryptNote('some-encrypted-stuff');
    expect(decrypted).toBe('[Encryption Key Not Available]');
  });
});
