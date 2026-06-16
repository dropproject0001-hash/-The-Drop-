import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encryptNote, decryptNote, isEncryptionAvailable, _resetCryptoState } from './crypto';
import { supabase } from './supabase';

vi.mock('./supabase', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));

  return {
    supabase: {
      from: mockFrom
    }
  };
});

describe('crypto utility', () => {
  const mockKey = '0123456789abcdef0123456789abcdef';

  beforeEach(() => {
    vi.clearAllMocks();
    _resetCryptoState();
  });

  it('should encrypt and decrypt a note correctly', async () => {
    const mockFrom = supabase.from as any;
    const mockSingle = mockFrom().select().eq().single;

    mockSingle.mockResolvedValue({
      data: { value: mockKey },
      error: null
    });

    const originalNote = 'Tactical secret message';
    const encrypted = await encryptNote(originalNote);

    expect(encrypted).not.toBe(originalNote);
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = await decryptNote(encrypted);
    expect(decrypted).toBe(originalNote);
  });

  it('should return empty string for empty input', async () => {
    expect(await encryptNote('')).toBe('');
    expect(await decryptNote('')).toBe('');
  });

  it('should handle decryption failure with invalid content', async () => {
    const mockFrom = supabase.from as any;
    const mockSingle = mockFrom().select().eq().single;

    mockSingle.mockResolvedValue({
      data: { value: mockKey },
      error: null
    });

    const result = await decryptNote('not-encrypted-at-all');
    expect(result).toBe('[Decryption Failed]');
  });

  it('should handle decryption error with malformed base64', async () => {
     const mockFrom = supabase.from as any;
     const mockSingle = mockFrom().select().eq().single;
     mockSingle.mockResolvedValue({ data: { value: mockKey }, error: null });

     const result = await decryptNote('!!! invalid base64 !!!');
     expect(result).toBe('[Decryption Failed]');
  });

  it('should report encryption availability correctly', async () => {
    const mockFrom = supabase.from as any;
    const mockSingle = mockFrom().select().eq().single;

    mockSingle.mockResolvedValue({
      data: { value: mockKey },
      error: null
    });

    expect(await isEncryptionAvailable()).toBe(true);
  });

  it('should fallback to plain text when key is not found', async () => {
    const mockFrom = supabase.from as any;
    const mockSingle = mockFrom().select().eq().single;

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Key not found' }
    });

    const note = 'Sensitive info';
    const result = await encryptNote(note);
    expect(result).toBe(note);
  });

  it('should return warning message if key is missing during decryption', async () => {
    const mockFrom = supabase.from as any;
    const mockSingle = mockFrom().select().eq().single;

    mockSingle.mockResolvedValue({ data: null, error: { message: 'No key' } });

    const result = await decryptNote('encrypted-stuff');
    expect(result).toBe('[Encryption Key Not Available]');
  });
});
