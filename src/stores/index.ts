import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BlendCanvasItem } from "@/types";

interface BlendState {
  name: string;
  description: string;
  brewTemp: number;
  brewTime: number;
  items: BlendCanvasItem[];
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setBrewTemp: (temp: number) => void;
  setBrewTime: (time: number) => void;
  addItem: (item: BlendCanvasItem) => void;
  removeItem: (ingredientId: string) => void;
  updateItemAmount: (ingredientId: string, amount: number) => void;
  reorderItems: (items: BlendCanvasItem[]) => void;
  reset: () => void;
  loadBlend: (data: {
    name: string;
    description?: string | null;
    brewTemp?: number | null;
    brewTime?: number | null;
    items: BlendCanvasItem[];
  }) => void;
}

const initialState = {
  name: "",
  description: "",
  brewTemp: 90,
  brewTime: 300,
  items: [] as BlendCanvasItem[],
};

export const useBlendStore = create<BlendState>()((set) => ({
  ...initialState,
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  setBrewTemp: (brewTemp) => set({ brewTemp }),
  setBrewTime: (brewTime) => set({ brewTime }),
  addItem: (item) =>
    set((state) => {
      const exists = state.items.find((i) => i.ingredientId === item.ingredientId);
      if (exists) return state;
      return { items: [...state.items, { ...item, order: state.items.length }] };
    }),
  removeItem: (ingredientId) =>
    set((state) => ({
      items: state.items
        .filter((i) => i.ingredientId !== ingredientId)
        .map((item, index) => ({ ...item, order: index })),
    })),
  updateItemAmount: (ingredientId, amount) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.ingredientId === ingredientId ? { ...i, amount } : i
      ),
    })),
  reorderItems: (items) => set({ items }),
  reset: () => set(initialState),
  loadBlend: (data) =>
    set({
      name: data.name,
      description: data.description ?? "",
      brewTemp: data.brewTemp ?? 90,
      brewTime: data.brewTime ?? 300,
      items: data.items,
    }),
}));

interface TimerState {
  seconds: number;
  initialSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
  blendName: string;
  blendId: string | null;
  recipeId: string | null;
  setDuration: (
    seconds: number,
    blendName?: string,
    context?: { blendId?: string; recipeId?: string }
  ) => void;
  clearBrewContext: () => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>()((set) => ({
  seconds: 300,
  initialSeconds: 300,
  isRunning: false,
  isComplete: false,
  blendName: "",
  blendId: null,
  recipeId: null,
  setDuration: (seconds, blendName = "", context) =>
    set({
      seconds,
      initialSeconds: seconds,
      isComplete: false,
      isRunning: false,
      blendName,
      blendId: context?.blendId ?? null,
      recipeId: context?.recipeId ?? null,
    }),
  clearBrewContext: () => set({ blendId: null, recipeId: null }),
  start: () => set({ isRunning: true, isComplete: false }),
  pause: () => set({ isRunning: false }),
  reset: () =>
    set((state) => ({
      seconds: state.initialSeconds,
      isRunning: false,
      isComplete: false,
    })),
  tick: () =>
    set((state) => {
      if (state.seconds <= 1) {
        return { seconds: 0, isRunning: false, isComplete: true };
      }
      return { seconds: state.seconds - 1 };
    }),
}));

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "infusion-theme" }
  )
);

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));

interface PreferencesState {
  alchemyOnApk: boolean;
  setAlchemyOnApk: (enabled: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      alchemyOnApk: true,
      setAlchemyOnApk: (alchemyOnApk) => set({ alchemyOnApk }),
    }),
    { name: "infusion-preferences" }
  )
);
