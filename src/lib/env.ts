// src/lib/env.ts
// Cleaned: Removed all legacy variables (project migrated to Supabase)
// FIX C-1: Harden to prevent boot-time crash. 
// Values are still accessed, but errors are caught and validateEnv handles reporting.

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  GEMINI_API_KEY?: string;
  VAPID_PUBLIC_KEY?: string;
  STADIA_API_KEY?: string;
  ENCRYPTION_KEY: string;
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

// Module-level state; won't throw now.
export const env: EnvConfig = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY', false),
  VAPID_PUBLIC_KEY: getEnvVar('VITE_VAPID_PUBLIC_KEY', false),
  STADIA_API_KEY: getEnvVar('VITE_STADIA_API_KEY', false),
  ENCRYPTION_KEY: getEnvVar('VITE_ENCRYPTION_KEY'),
};

// Optional: Runtime validation helper
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

  if (!env.ENCRYPTION_KEY || env.ENCRYPTION_KEY.length < 10) {
    missing.push('VITE_ENCRYPTION_KEY');
  }
  
  return {
    ok: missing.length === 0,
    missing
  };
}
