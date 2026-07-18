"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores";
import { isOfflineDemo } from "@/lib/offline-demo/api";

/** Optional alchemy theme on offline APK (web always uses alchemy via layout). */
export function AlchemyThemeBridge() {
  const alchemyOnApk = usePreferencesStore((s) => s.alchemyOnApk);

  useEffect(() => {
    if (!isOfflineDemo()) return;
    document.documentElement.classList.toggle("theme-alchemy", alchemyOnApk);
  }, [alchemyOnApk]);

  return null;
}
