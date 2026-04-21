import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  clear: () => set({ user: null, session: null, profile: null }),
}));
