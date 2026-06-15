import { createClient } from '@supabase/supabase-js';
import { secureStorage } from './secureStorage';

export const rawUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
export const rawKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

/**
 * Validates Supabase credentials
 */
export function validateSupabaseCredentials() {
  const errors: string[] = [];

  if (!rawUrl) {
    errors.push('VITE_SUPABASE_URL is missing.');
  } else if (!rawUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://');
  } else if (!rawUrl.includes('.supabase.co')) {
    errors.push('VITE_SUPABASE_URL must be a valid .supabase.co domain.');
  }

  if (!rawKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing.');
  } else if (rawKey.length < 20) {
    errors.push('VITE_SUPABASE_ANON_KEY is too short to be a valid JWT.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    url: rawUrl,
    key: rawKey
  };
}

const validation = validateSupabaseCredentials();

if (!validation.isValid) {
  console.error('[Supabase] CONFIGURATION ERROR(S):', validation.errors.join(' '));
}

// Custom storage adapter for Supabase that uses encrypted secureStorage
const customStorage = {
  getItem: (key: string) => secureStorage.getItem(key),
  setItem: (key: string, value: string) => secureStorage.setItem(key, value),
  removeItem: (key: string) => secureStorage.removeItem(key),
};

// Ensure the client is created even with invalid credentials to avoid breakage in early boot,
// but it will fail on use. The EnvChecker will block the UI if invalid.
export const supabase = createClient(
  validation.isValid ? rawUrl : 'https://placeholder.supabase.co',
  validation.isValid ? rawKey : 'placeholder-key-do-not-use',
  {
    auth: {
      storage: customStorage as any,
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

console.log('[Supabase] Initialized. Configured:', validation.isValid);

export const isSupabaseConfigured = validation.isValid;
export const supabaseValidationErrors = validation.errors;

export function getSupabaseErrorMessage(): string | null {
  if (isSupabaseConfigured) return null;
  return validation.errors.length > 0 ? `Configuration Error: ${validation.errors[0]}` : 'Unknown Configuration Error';
}
