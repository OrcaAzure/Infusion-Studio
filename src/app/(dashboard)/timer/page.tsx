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

export default function TimerPage() {
  const [customMinutes, setCustomMinutes] = useState(5);
  const setDuration = useTimerStore((s) => s.setDuration);
  const activePreset = useTimerStore((s) => s.blendName);

  const setCustomDuration = () => {
    setDuration(customMinutes * 60, "Custom brew");
  };

  return (
    <div>
      <DashboardHeader
        title="Brew Timer"
        description="Precision timing for the perfect infusion"
      />

      <BrewTimer />

      <div className="mx-auto mt-8 max-w-md">
        <h3 className="mb-3 text-center text-sm font-medium text-stone-700 dark:text-stone-300">
          Quick Presets
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant={activePreset === preset.label ? "default" : "outline"}
              size="sm"
              className="flex h-auto flex-col gap-0.5 py-2"
              onClick={() => setDuration(preset.seconds, preset.label)}
            >
              <span>{preset.label}</span>
              <span className="text-xs opacity-80">{formatTime(preset.seconds)}</span>
            </Button>
          ))}
        </div>

        <div className="mt-6 flex items-end gap-3">
          <NumberInput
            label="Custom duration (minutes)"
            value={customMinutes}
            onChange={setCustomMinutes}
            min={1}
            max={60}
            className="flex-1"
          />
          <Button onClick={setCustomDuration}>Set</Button>
        </div>
      </div>
    </div>
  );
}
