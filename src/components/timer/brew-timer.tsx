"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Bell } from "lucide-react";
import { useTimerStore } from "@/stores";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BrewTimerProps {
  defaultSeconds?: number;
  blendName?: string;
}

export function BrewTimer({ defaultSeconds = 300, blendName = "" }: BrewTimerProps) {
  const {
    seconds,
    initialSeconds,
    isRunning,
    isComplete,
    blendName: storeBlendName,
    setDuration,
    start,
    pause,
    reset,
    tick,
  } = useTimerStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayName = storeBlendName || blendName;

  useEffect(() => {
    setDuration(defaultSeconds, blendName);
  }, [defaultSeconds, blendName, setDuration]);

  // Tick interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  // Browser notification on completion
  useEffect(() => {
    if (isComplete && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Brew Complete!", {
          body: displayName ? `${displayName} is ready to enjoy` : "Your infusion is ready",
        });
      }
    }
  }, [isComplete, displayName]);

  const requestNotification = useCallback(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const progress = ((initialSeconds - seconds) / initialSeconds) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="mx-auto max-w-md text-center">
      {displayName && (
        <p className="mb-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Brewing: {displayName}
        </p>
      )}

      <div className="relative mx-auto my-8 h-64 w-64">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 260 260">
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-stone-200 dark:text-stone-700"
          />
          <motion.circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-emerald-500"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="complete"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <Bell className="mb-2 h-8 w-8 text-emerald-500" />
                <span className="text-lg font-semibold text-emerald-600">Ready!</span>
              </motion.div>
            ) : (
              <motion.span
                key="timer"
                className="text-5xl font-bold tabular-nums text-stone-900 dark:text-stone-100"
              >
                {formatTime(seconds)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {!isRunning && !isComplete && (
          <Button size="lg" onClick={() => { requestNotification(); start(); }}>
            <Play className="h-5 w-5" />
            Start
          </Button>
        )}
        {isRunning && (
          <Button size="lg" variant="secondary" onClick={pause}>
            <Pause className="h-5 w-5" />
            Pause
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={reset}>
          <RotateCcw className="h-5 w-5" />
          Reset
        </Button>
      </div>
    </Card>
  );
}
