import { validateSupabaseCredentials } from './supabase';

/**
 * Validates the current environment configuration.
 * Used by the EnvChecker and CI/CD tools.
 */
export function validateEnv() {
  const supabase = validateSupabaseCredentials();

  const errors: string[] = [...supabase.errors];
  const warnings: string[] = [];

  // Check optional but recommended vars
  if (!import.meta.env.VITE_CRYPTO_SECRET) {
    warnings.push('VITE_CRYPTO_SECRET is missing. App will use database-stored key.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Allow running as a standalone script via tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateEnv();
  if (result.isValid) {
    console.log('✅ [Env] Configuration is valid.');
    if (result.warnings.length > 0) {
      console.warn('⚠️ [Env] Warnings:', result.warnings);
    }
    process.exit(0);
  } else {
    console.error('❌ [Env] Configuration errors:', result.errors);
    process.exit(1);
  }
}
