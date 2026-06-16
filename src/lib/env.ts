// src/lib/env.ts
/**
 * ENVIRONMENT VARIABLE MANAGEMENT
 * Centralizes access to all environment variables.
 * Handles validation and provides sensible fallbacks for development.
 */

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  GEMINI_API_KEY?: string;
  VAPID_PUBLIC_KEY?: string;
  STADIA_API_KEY?: string;
  CRYPTO_SECRET?: string;
  SECURE_STORAGE_SALT?: string;
}

function getEnvVar(key: string, required = true): string {
  try {
    const value = ((import.meta as any).env[key] as string | undefined)?.trim();
    if (required && !value) {
      console.warn(`[Env] Missing required variable: ${key}`);
      return '';
    }
    return value || '';
  } catch (e) {
    console.error(`[Env] Error accessing ${key}:`, e);
    return '';
  }
}

// Module-level state
export const env: EnvConfig = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY', false),
  VAPID_PUBLIC_KEY: getEnvVar('VITE_VAPID_PUBLIC_KEY', false),
  STADIA_API_KEY: getEnvVar('VITE_STADIA_API_KEY', false),
  CRYPTO_SECRET: getEnvVar('VITE_CRYPTO_SECRET', false),
  SECURE_STORAGE_SALT: getEnvVar('VITE_SECURE_STORAGE_SALT', false),
};

// Runtime validation helper
export interface EnvValidationResult {
  ok: boolean;
  missing: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  
  if (!env.SUPABASE_URL || !env.SUPABASE_URL.includes('supabase.co')) {
    missing.push('VITE_SUPABASE_URL');
  }
  
  if (!env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY.length < 20) {
    missing.push('VITE_SUPABASE_ANON_KEY');
  }
  
  return {
    ok: missing.length === 0,
    missing
  };
}
