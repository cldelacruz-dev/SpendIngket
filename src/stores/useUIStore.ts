import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "system" | "light" | "dark";

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  theme: Theme;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeModal: null,
      theme: "system",
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "spendingket-ui",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
