"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Samsung/Android install banner — shows when PWA is installable */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    );

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone || dismissed || !deferred) return null;

  const install = async () => {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setDeferred(null);
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-md animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-emerald-800 dark:bg-stone-900/95">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Install Infusion Studio
          </p>
          <p className="text-xs text-stone-500">Add to your Samsung home screen</p>
        </div>
        <Button size="sm" onClick={install}>
          Install
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="text-stone-400 hover:text-stone-600"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
