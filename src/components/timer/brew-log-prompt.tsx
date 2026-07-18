"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTimerStore } from "@/stores";
import { useToast } from "@/components/ui/toast";
import { cacheInvalidate } from "@/lib/client-cache";
import { Star, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrewLogPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BrewLogPrompt({ isOpen, onClose }: BrewLogPromptProps) {
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const toast = useToast((s) => s.show);
  const { blendId, recipeId, blendName, clearBrewContext } = useTimerStore();

  const resetForm = () => {
    setNotes("");
    setRating(0);
    setStreak(null);
  };

  const handleSave = async () => {
    if (!blendId) {
      onClose();
      return;
    }

    setSaving(true);
    const res = await fetch("/api/brew-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blendId,
        recipeId: recipeId ?? undefined,
        notes: notes.trim() || undefined,
        rating: rating > 0 ? rating : undefined,
      }),
    });
    setSaving(false);

    if (res.ok) {
      const body = await res.json();
      cacheInvalidate("dashboard");
      cacheInvalidate("brew-logs");
      if (typeof body.streak === "number") {
        setStreak(body.streak);
        toast(`Brew logged — ${body.streak} day streak!`);
        return;
      }
      toast("Brew logged");
      resetForm();
      clearBrewContext();
      onClose();
    } else {
      toast("Could not save brew log");
    }
  };

  const handleDone = () => {
    resetForm();
    clearBrewContext();
    onClose();
  };

  const handleSkip = () => {
    resetForm();
    clearBrewContext();
    onClose();
  };

  if (streak !== null) {
    return (
      <Modal isOpen={isOpen} onClose={handleDone} title="Brew session complete">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="alchemy-icon-badge mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white">
            <Flame className="h-7 w-7" />
          </div>
          <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">{streak} day streak</p>
          <p className="mt-2 text-sm text-stone-500">Keep brewing to grow your streak.</p>
          <Button className="mt-6 w-full" onClick={handleDone}>
            Continue
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} title="Log this brew?">
      <p className="mb-4 text-sm text-stone-600 dark:text-stone-400">
        {blendName ? `"${blendName}" is ready.` : "Your infusion is ready."} Rate and note this
        session.
      </p>

      <div className="mb-4 flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="rounded-lg p-1 transition-transform hover:scale-110"
            aria-label={`Rate ${n} stars`}
          >
            <Star
              className={cn(
                "h-7 w-7",
                n <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-stone-300 dark:text-stone-600"
              )}
            />
          </button>
        ))}
      </div>

      <Textarea
        placeholder="e.g. Steeped 5 min, slightly floral today..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="mb-4"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={handleSkip}>
          Skip
        </Button>
        <Button onClick={handleSave} isLoading={saving} data-testid="brew-log-save">
          Save to brew log
        </Button>
      </div>
    </Modal>
  );
}
