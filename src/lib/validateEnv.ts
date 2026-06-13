// src/lib/validateEnv.ts
// Dedicated environment validation module (Supabase-only)

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
  const supabaseKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();
  const encryptionKey = ((import.meta as any).env.VITE_ENCRYPTION_KEY || '').trim();

  // Critical checks
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is missing');
  } else if (!supabaseUrl.includes('supabase.co')) {
    errors.push('VITE_SUPABASE_URL does not look like a valid Supabase URL');
  }

  if (!supabaseKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing');
  } else if (supabaseKey.length < 30) {
    errors.push('VITE_SUPABASE_ANON_KEY appears too short');
  }

  if (!encryptionKey) {
    errors.push('VITE_ENCRYPTION_KEY is missing');
  } else if (encryptionKey.length < 16) {
    errors.push('VITE_ENCRYPTION_KEY is too short (min 16 chars)');
  }

  // Optional but recommended
  const geminiKey = ((import.meta as any).env.GEMINI_API_KEY || '').trim();
  if (!geminiKey) {
    warnings.push('GEMINI_API_KEY is not set (AI features may be limited)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getEnvValidationResult(): EnvValidationResult {
  return validateEnv();
}
