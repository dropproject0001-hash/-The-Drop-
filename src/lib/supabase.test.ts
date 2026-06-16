import { describe, it, expect } from 'vitest';
import { validateSupabaseCredentials, getSupabaseErrorMessage, isSupabaseConfigured } from './supabase';

describe('supabase.ts validation', () => {
  it('should validate correctly with valid parameters', () => {
    const url = 'https://xyz.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-long-enough-key';
    const result = validateSupabaseCredentials(url, key);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation if URL is missing', () => {
    const result = validateSupabaseCredentials('', 'some-key');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('VITE_SUPABASE_URL is missing.');
  });

  it('should fail validation if URL is not https', () => {
    const result = validateSupabaseCredentials('http://xyz.supabase.co', 'some-key');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('VITE_SUPABASE_URL must start with https://');
  });

  it('should fail validation if URL is not a supabase domain', () => {
    const result = validateSupabaseCredentials('https://myserver.com', 'some-key');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('VITE_SUPABASE_URL must be a valid .supabase.co domain.');
  });

  it('should fail validation if key is too short', () => {
    const result = validateSupabaseCredentials('https://xyz.supabase.co', 'short-key');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('VITE_SUPABASE_ANON_KEY is too short to be a valid JWT.');
  });

  it('should use default values if no parameters provided', () => {
    const result = validateSupabaseCredentials();
    // In test environment, these are placeholders from vitest.setup.ts
    expect(result.url).toBe('https://xyz.supabase.co');
  });

  it('should return error message when not configured', () => {
    if (!isSupabaseConfigured) {
      expect(getSupabaseErrorMessage()).not.toBeNull();
    } else {
      expect(getSupabaseErrorMessage()).toBeNull();
    }
  });
});
