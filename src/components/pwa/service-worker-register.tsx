"use client";

import { useEffect } from "react";

/** Registers the PWA service worker for installable Samsung/Android app experience */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => console.warn("SW registration failed:", err));
  }, []);

  return null;
}
