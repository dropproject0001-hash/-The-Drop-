import { create } from 'zustand';
import type { Profile, Drop } from '@/types/domain';

interface AuthState {
  session: any | null;
  profile: Profile | null;
  initialized: boolean;
  setSession: (session: any | null) => void;
  setProfile: (profile: Profile | null) => void;
  setInitialized: (initialized: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  profile: null,
  initialized: false,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setInitialized: (initialized) => set({ initialized }),
  clear: () => set({ session: null, profile: null, initialized: true }),
}));

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
