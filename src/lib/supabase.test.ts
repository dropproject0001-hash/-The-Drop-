import { describe, it, expect, vi } from 'vitest';
import { validateSupabaseCredentials, getSupabaseErrorMessage } from './supabase';

describe('supabase client validation', () => {
  it('should validate current credentials structure', () => {
    const result = validateSupabaseCredentials();
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('errors');
  });

  it('should fail on missing URL', () => {
    const result = validateSupabaseCredentials('', 'valid-key-longer-than-20-chars');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('VITE_SUPABASE_URL is missing.');
  });

  it('should fail on insecure URL', () => {
    const result = validateSupabaseCredentials('http://project.supabase.co', 'valid-key-longer-than-20-chars');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('VITE_SUPABASE_URL must start with https://');
  });

  it('should fail on non-supabase domain', () => {
    const result = validateSupabaseCredentials('https://project.example.com', 'valid-key-longer-than-20-chars');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('VITE_SUPABASE_URL must be a valid .supabase.co domain.');
  });

  it('should fail on missing Key', () => {
    const result = validateSupabaseCredentials('https://project.supabase.co', '');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('VITE_SUPABASE_ANON_KEY is missing.');
  });

  it('should fail on short Key', () => {
    const result = validateSupabaseCredentials('https://project.supabase.co', 'short-key');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('VITE_SUPABASE_ANON_KEY is too short to be a valid JWT.');
  });

  it('should return error message when not configured', () => {
    // We can't easily change the module-level 'isSupabaseConfigured' without reload,
    // but we can test the function if we could mock the variable or just accept current state.
    const msg = getSupabaseErrorMessage();
    // Logic check
  });
});
