import { describe, it, expect, vi, beforeEach } from 'vitest';
import { secureStorage } from './secureStorage';

describe('secureStorage.ts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Mock SubtleCrypto for AES-GCM
    const mockKey = { type: 'secret', extractable: true, algorithm: { name: 'AES-GCM' }, usages: ['encrypt', 'decrypt'] };
    (window.crypto.subtle.importKey as any).mockResolvedValue(mockKey);
    (window.crypto.subtle.deriveKey as any).mockResolvedValue(mockKey);

    // Mock encrypt to return a fixed "encrypted" buffer
    (window.crypto.subtle.encrypt as any).mockImplementation(async ({ iv }, key, data) => {
      return data.buffer; // Mock: return raw data as "encrypted"
    });

    // Mock decrypt to return the original buffer
    (window.crypto.subtle.decrypt as any).mockImplementation(async ({ iv }, key, data) => {
      return data; // Mock: return what was passed
    });
  });

  it('should set and get an item securely', async () => {
    const key = 'test-key';
    const value = 'tactical-data';

    await secureStorage.setItem(key, value);

    // Check if it's in localStorage with prefix
    const stored = localStorage.getItem(`the-drop-secure-${key}`);
    expect(stored).not.toBeNull();
    expect(stored).not.toBe(value);

    const retrieved = await secureStorage.getItem(key);
    expect(retrieved).toBe(value);
  });

  it('should return null for non-existent items', async () => {
    const retrieved = await secureStorage.getItem('non-existent');
    expect(retrieved).toBeNull();
  });

  it('should remove items correctly', async () => {
    const key = 'remove-me';
    await secureStorage.setItem(key, 'data');
    secureStorage.removeItem(key);

    const retrieved = await secureStorage.getItem(key);
    expect(retrieved).toBeNull();
  });

  it('should clear all secure items but not public ones', async () => {
    await secureStorage.setItem('secure1', 'val1');
    await secureStorage.setItem('secure2', 'val2');
    secureStorage.setPublicItem('public1', 'val3');

    secureStorage.clear();

    expect(await secureStorage.getItem('secure1')).toBeNull();
    expect(await secureStorage.getItem('secure2')).toBeNull();
    expect(secureStorage.getPublicItem('public1')).toBe('val3');
  });

  it('should handle public items correctly', () => {
    secureStorage.setPublicItem('theme', 'dark');
    expect(secureStorage.getPublicItem('theme')).toBe('dark');
    expect(localStorage.getItem('public-theme')).toBe('dark');
  });
});
