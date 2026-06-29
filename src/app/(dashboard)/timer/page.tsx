"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { BrewTimer } from "@/components/timer/brew-timer";
import { NumberInput } from "@/components/ui/number-input";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/stores";
import { formatTime } from "@/lib/utils";

const PRESETS = [
  { label: "Green Tea", seconds: 180 },
  { label: "Black Tea", seconds: 300 },
  { label: "Herbal", seconds: 420 },
  { label: "Oolong", seconds: 240 },
];

function secondsFromHms(h: number, m: number, s: number) {
  return h * 3600 + m * 60 + s;
}

function hmsFromSeconds(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, m, s };
}

export default function TimerPage() {
  const setDuration = useTimerStore((s) => s.setDuration);
  const activePreset = useTimerStore((s) => s.blendName);
  const initialSeconds = useTimerStore((s) => s.initialSeconds);

  const [hms, setHms] = useState(() => hmsFromSeconds(300));

  const setCustomDuration = () => {
    const total = secondsFromHms(hms.h, hms.m, hms.s);
    if (total < 1) return;
    setDuration(total, "Custom brew");
    setHms(hmsFromSeconds(total));
  };

  return (
    <div>
      <DashboardHeader
        title="Brew Timer"
        description="Precision timing for the perfect infusion"
      />

      <BrewTimer />

      <div className="mx-auto mt-8 max-w-md space-y-6">
        <div className="rounded-xl border border-stone-200 bg-white/80 p-4 dark:border-stone-700 dark:bg-stone-900/80">
          <h3 className="mb-3 text-center text-sm font-medium text-stone-700 dark:text-stone-300">
            Custom duration
          </h3>
          <div className="mb-3 grid grid-cols-3 gap-2">
            <NumberInput
              label="Hours"
              value={hms.h}
              onChange={(h) => setHms((prev) => ({ ...prev, h }))}
              min={0}
              max={23}
            />
            <NumberInput
              label="Minutes"
              value={hms.m}
              onChange={(m) => setHms((prev) => ({ ...prev, m }))}
              min={0}
              max={59}
            />
            <NumberInput
              label="Seconds"
              value={hms.s}
              onChange={(s) => setHms((prev) => ({ ...prev, s }))}
              min={0}
              max={59}
            />
          </div>
          <Button onClick={setCustomDuration} className="w-full">
            Set {formatTime(secondsFromHms(hms.h, hms.m, hms.s))}
          </Button>
        </div>

        <div>
          <h3 className="mb-3 text-center text-sm font-medium text-stone-700 dark:text-stone-300">
            Quick presets
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant={activePreset === preset.label ? "default" : "outline"}
                size="sm"
                className="flex h-auto flex-col gap-0.5 py-2"
                onClick={() => {
                  setDuration(preset.seconds, preset.label);
                  setHms(hmsFromSeconds(preset.seconds));
                }}
              >
                <span>{preset.label}</span>
                <span className="text-xs opacity-80">{formatTime(preset.seconds)}</span>
              </Button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-stone-400">
          Current timer: {formatTime(initialSeconds)}
        </p>
      </div>
    </div>
  );
}
