import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock SubtleCrypto
const cryptoMock = {
  subtle: {
    importKey: vi.fn(),
    deriveKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    deriveBits: vi.fn(),
  },
  getRandomValues: vi.fn((arr) => arr),
};

Object.defineProperty(window, 'crypto', {
  value: cryptoMock,
});

// Stub environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://xyz.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMjUwMDAwMCwiZXhwIjoyNjIyNTAwMDAwfQ.placeholder');
vi.stubEnv('VITE_CRYPTO_SECRET', 'TEST_CRYPTO_SECRET_KEY_MIN_32_CHARS_LONG');
