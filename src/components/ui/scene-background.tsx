"use client";

import { BrewAmbience } from "@/components/ui/brew-ambience";
import { LightRays } from "@/registry/magicui/light-rays";
import { isOfflineApk } from "@/lib/offline-demo/api";

/** Brewing atmosphere — alchemy gold-green on web, standard emerald on offline APK. */
export function SceneBackground() {
  const alchemy = !isOfflineApk();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <LightRays
        count={5}
        color={alchemy ? "rgba(201, 162, 39, 0.14)" : "rgba(52, 211, 153, 0.16)"}
        blur={36}
        speed={18}
        length="80vh"
        className="opacity-75 dark:opacity-55"
      />
      <LightRays
        count={3}
        color={alchemy ? "rgba(64, 145, 108, 0.18)" : "rgba(20, 184, 166, 0.1)"}
        blur={44}
        speed={24}
        length="60vh"
        className="opacity-50"
      />
      {alchemy && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(45,106,79,0.12),transparent)]" />
      )}
      <BrewAmbience />
    </div>
  );
}
