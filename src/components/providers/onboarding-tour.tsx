"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { isOfflineDemo } from "@/lib/offline-demo/api";

const ONBOARDING_KEY = "hasSeenOnboarding";

const STEPS = [
  {
    tourId: "ingredients",
    title: "Your pantry",
    body: "Add your teas and herbs here",
  },
  {
    tourId: "blend-creator",
    title: "Blend Creator",
    body: "Drag ingredients to craft your blend",
  },
  {
    tourId: "timer",
    title: "Brew Timer",
    body: "Time your brew to perfection",
  },
] as const;

async function getOnboardingFlag(): Promise<boolean> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key: ONBOARDING_KEY });
    return value === "true";
  } catch {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  }
}

async function setOnboardingFlag() {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key: ONBOARDING_KEY, value: "true" });
  } catch {
    localStorage.setItem(ONBOARDING_KEY, "true");
  }
}

export function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOfflineDemo()) return;
    void getOnboardingFlag().then((seen) => {
      if (!seen) setVisible(true);
    });
  }, []);

  const finish = () => {
    void setOnboardingFlag();
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex min-h-dvh flex-col justify-end bg-black/50 p-4">
      <div className="relative mx-auto w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl dark:border-stone-700 dark:bg-stone-900">
        <span
          className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center"
          aria-hidden
        >
          <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>

        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-600">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
          {current.title}
        </h2>
        <p className="mb-4 text-sm text-stone-600 dark:text-stone-400">{current.body}</p>
        <p className="mb-4 text-xs text-stone-400">
          Look for the pulsing dot in the sidebar on &quot;
          {current.tourId === "blend-creator" ? "Blend Creator" : current.title}&quot;.
        </p>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={finish}
            className="text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
          >
            Skip
          </button>
          <Button
            onClick={() => {
              if (isLast) finish();
              else setStep((s) => s + 1);
            }}
          >
            {isLast ? "Get started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
