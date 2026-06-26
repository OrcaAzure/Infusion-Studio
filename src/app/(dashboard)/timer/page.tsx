"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { BrewTimer } from "@/components/timer/brew-timer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/stores";
import { formatTime } from "@/lib/utils";

const PRESETS = [
  { label: "Green Tea", seconds: 180, temp: 80 },
  { label: "Black Tea", seconds: 300, temp: 95 },
  { label: "Herbal", seconds: 420, temp: 100 },
  { label: "Oolong", seconds: 240, temp: 90 },
];

export default function TimerPage() {
  const [customMinutes, setCustomMinutes] = useState(5);
  const setDuration = useTimerStore((s) => s.setDuration);
  const initialSeconds = useTimerStore((s) => s.initialSeconds);

  const setCustomDuration = () => {
    setDuration(customMinutes * 60);
  };

  return (
    <div>
      <DashboardHeader
        title="Brew Timer"
        description="Precision timing for the perfect infusion"
      />

      <BrewTimer defaultSeconds={initialSeconds} />

      <div className="mx-auto mt-8 max-w-md">
        <h3 className="mb-3 text-center text-sm font-medium text-stone-700 dark:text-stone-300">
          Quick Presets
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => setDuration(preset.seconds, preset.label)}
            >
              {preset.label}
              <span className="text-xs text-stone-400">
                {formatTime(preset.seconds)}
              </span>
            </Button>
          ))}
        </div>

        <div className="mt-6 flex items-end gap-3">
          <Input
            label="Custom duration (minutes)"
            type="number"
            min={1}
            max={60}
            value={customMinutes}
            onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
            className="flex-1"
          />
          <Button onClick={setCustomDuration}>Set</Button>
        </div>
      </div>
    </div>
  );
}
