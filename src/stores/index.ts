import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Profile, Drop, LocationBroadcast } from '@/types/domain';

interface AuthState {
  session: any | null;
  profile: Profile | null;
  setSession: (session: any | null) => void;
  setProfile: (profile: Profile | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      session: null,
      profile: null,
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      clear: () => set({ session: null, profile: null }),
    }),
    { enabled: process.env.NODE_ENV === 'development', name: 'AuthStore' }
  )
);

interface DropState {
  drops: Drop[];
  setDrops: (drops: Drop[]) => void;
  addDrop: (drop: Drop) => void;
  updateDrop: (drop: Drop) => void;
  removeDrop: (id: string) => void;
}

export const useDropStore = create<DropState>()(
  devtools(
    (set) => ({
      drops: [],
      setDrops: (drops) => set({ drops }),
      addDrop: (drop) => set((state) => ({ drops: [...state.drops, drop] })),
      updateDrop: (drop) => set((state) => ({
        drops: state.drops.map((d) => d.id === drop.id ? drop : d)
      })),
      removeDrop: (id) => set((state) => ({
        drops: state.drops.filter((d) => d.id !== id)
      })),
    }),
    { enabled: process.env.NODE_ENV === 'development', name: 'DropStore' }
  )
);
