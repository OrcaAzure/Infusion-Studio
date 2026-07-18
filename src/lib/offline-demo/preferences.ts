import { isOfflineApk } from "./api";

const STORAGE_KEY = "infusion-studio-offline-demo";

export async function demoStorageGet(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (isOfflineApk()) {
    try {
      const { Preferences } = await import("@capacitor/preferences");
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      return value;
    } catch {
      return localStorage.getItem(STORAGE_KEY);
    }
  }
  return localStorage.getItem(STORAGE_KEY);
}

export async function demoStorageSet(value: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (isOfflineApk()) {
    try {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({ key: STORAGE_KEY, value });
      return;
    } catch {
      /* fall through */
    }
  }
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* quota */
  }
}

export async function demoStorageRemove(): Promise<void> {
  if (typeof window === "undefined") return;
  if (isOfflineApk()) {
    try {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.remove({ key: STORAGE_KEY });
      return;
    } catch {
      /* fall through */
    }
  }
  localStorage.removeItem(STORAGE_KEY);
}
