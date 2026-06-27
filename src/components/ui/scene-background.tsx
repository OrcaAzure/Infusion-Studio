"use client";

import { BrewAmbience } from "@/components/ui/brew-ambience";
import { LightRays } from "@/registry/magicui/light-rays";

/** Combined brewing atmosphere: light rays + steam & bubbles */
export function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <LightRays
        count={9}
        color="rgba(52, 211, 153, 0.18)"
        blur={40}
        speed={16}
        length="80vh"
        className="opacity-80 dark:opacity-60"
      />
      <LightRays
        count={4}
        color="rgba(20, 184, 166, 0.12)"
        blur={50}
        speed={22}
        length="60vh"
        className="opacity-50"
      />
      <BrewAmbience />
    </div>
  );
}
