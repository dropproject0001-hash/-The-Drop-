// src/lib/env.ts
// Cleaned: Removed all legacy variables (project migrated to Supabase)

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  GEMINI_API_KEY?: string;
  VAPID_PUBLIC_KEY?: string;
  STADIA_API_KEY?: string;
}

function getEnvVar(key: string, required = true): string {
  const value = ((import.meta as any).env[key] as string | undefined)?.trim();

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

export const env: EnvConfig = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY', false),
  VAPID_PUBLIC_KEY: getEnvVar('VITE_VAPID_PUBLIC_KEY', false),
  STADIA_API_KEY: getEnvVar('VITE_STADIA_API_KEY', false),
};

// Optional: Runtime validation helper
export interface EnvValidationResult {
  ok: boolean;
  missing: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  if (!env.SUPABASE_URL.includes('supabase.co')) missing.push('VITE_SUPABASE_URL');
  if (env.SUPABASE_ANON_KEY.length < 20) missing.push('VITE_SUPABASE_ANON_KEY');
  
  return {
    ok: missing.length === 0,
    missing
  };
}
