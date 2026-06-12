/**
 * @file src/stores/index.ts
 *
 * FIX H-1: devtools `enabled` now uses `import.meta.env.DEV` (Vite) instead of
 *           `process.env.NODE_ENV` which doesn't exist in ESM/Vite builds.
 * FIX M-3: Removed unused `LocationBroadcast` import.
 */
import { create } from 'zustand';
import type { Profile, Drop } from '@/types/domain';

// ── Auth Store ────────────────────────────────────────────────────────────────

interface AuthState {
  /** Raw Supabase session object (typed loosely to avoid supabase-js type coupling). */
  session: unknown | null;
  profile: Profile | null;
  setSession: (session: unknown | null) => void;
  setProfile: (profile: Profile | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  profile: null,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  clear: () => set({ session: null, profile: null }),
}));

// ── Drop Store ────────────────────────────────────────────────────────────────

interface DropState {
  drops: Drop[];
  setDrops: (drops: Drop[]) => void;
  addDrop: (drop: Drop) => void;
  updateDrop: (drop: Drop) => void;
  removeDrop: (id: string) => void;
}

export const useDropStore = create<DropState>()((set) => ({
  drops: [],
  setDrops: (drops) => set({ drops }),
  addDrop: (drop) =>
    set((state) => ({ drops: [...state.drops, drop] })),
  updateDrop: (drop) =>
    set((state) => ({
      drops: state.drops.map((d) => (d.id === drop.id ? drop : d)),
    })),
  removeDrop: (id) =>
    set((state) => ({
      drops: state.drops.filter((d) => d.id !== id),
    })),
}));
