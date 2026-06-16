import { describe, it, expect, vi } from 'vitest';
import { validateEnv } from './validateEnv';
import { validateSupabaseCredentials } from './supabase';

vi.mock('./supabase', () => ({
  validateSupabaseCredentials: vi.fn()
}));

describe('environment validation', () => {
  it('should return a valid result when supabase is valid', () => {
    (validateSupabaseCredentials as any).mockReturnValue({
      isValid: true,
      errors: []
    });

    const result = validateEnv();
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should include supabase errors when invalid', () => {
    (validateSupabaseCredentials as any).mockReturnValue({
      isValid: false,
      errors: ['Invalid URL']
    });

    const result = validateEnv();
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid URL');
  });
});
