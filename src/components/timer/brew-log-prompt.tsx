"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTimerStore } from "@/stores";
import { useToast } from "@/components/ui/toast";

interface BrewLogPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BrewLogPrompt({ isOpen, onClose }: BrewLogPromptProps) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast((s) => s.show);
  const { blendId, recipeId, blendName, clearBrewContext } = useTimerStore();

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
      }),
    });
    setSaving(false);

    if (res.ok) {
      toast("Brew logged");
      setNotes("");
      clearBrewContext();
      onClose();
    } else {
      toast("Could not save brew log");
    }
  };

  const handleSkip = () => {
    setNotes("");
    clearBrewContext();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} title="Log this brew?">
      <p className="mb-4 text-sm text-stone-600 dark:text-stone-400">
        {blendName ? `"${blendName}" is ready.` : "Your infusion is ready."} Add an optional note
        to your brew history.
      </p>
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
        <Button onClick={handleSave} isLoading={saving}>
          Save to brew log
        </Button>
      </div>
    </Modal>
  );
}
