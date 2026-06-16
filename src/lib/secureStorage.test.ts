import { describe, it, expect, beforeEach } from 'vitest';
import { secureStorage } from './secureStorage';

describe('secureStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    secureStorage.clear();
  });

  it('should store and retrieve an encrypted item', async () => {
    const key = 'secret-token';
    const value = 'super-secret-value-123';

    await secureStorage.setItem(key, value);

    const raw = localStorage.getItem('the-drop-secure-' + key);
    expect(raw).not.toBe(value);
    expect(raw).not.toBeNull();

    const retrieved = await secureStorage.getItem(key);
    expect(retrieved).toBe(value);
  });

  it('should return null for non-existent items', async () => {
    const retrieved = await secureStorage.getItem('missing');
    expect(retrieved).toBeNull();
  });

  it('should remove an item', async () => {
    await secureStorage.setItem('temp', 'value');
    expect(await secureStorage.getItem('temp')).toBe('value');

    secureStorage.removeItem('temp');
    expect(await secureStorage.getItem('temp')).toBeNull();
  });

  it('should clear all secure items', async () => {
    await secureStorage.setItem('k1', 'v1');
    await secureStorage.setItem('k2', 'v2');
    secureStorage.setPublicItem('p1', 'v3');

    secureStorage.clear();

    expect(await secureStorage.getItem('k1')).toBeNull();
    expect(await secureStorage.getItem('k2')).toBeNull();
    expect(secureStorage.getPublicItem('p1')).toBe('v3');
  });

  it('should store public items in plain text', () => {
    const key = 'theme';
    const value = 'tactical-neon';

    secureStorage.setPublicItem(key, value);
    expect(localStorage.getItem('public-' + key)).toBe(value);
    expect(secureStorage.getPublicItem(key)).toBe(value);
  });

  it('should handle decryption failure gracefully', async () => {
    localStorage.setItem('the-drop-secure-bad', 'invalid-base64');
    const result = await secureStorage.getItem('bad');
    expect(result).toBeNull();
  });
});
