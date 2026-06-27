"use client";

import { useState } from "react";
import { Instagram, Copy, Check, Share2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OvenInfusionCard } from "@/components/discover/oven-infusion-card";
import type { RecipeWithBlend, SharedRecipe } from "@/types";

interface ShareRecipeModalProps {
  recipe: RecipeWithBlend;
  socialHandle?: string;
  isOpen: boolean;
  onClose: () => void;
  onShared: () => void;
}

export function ShareRecipeModal({
  recipe,
  socialHandle = "oven_infusion",
  isOpen,
  onClose,
  onShared,
}: ShareRecipeModalProps) {
  const [shareTitle, setShareTitle] = useState(recipe.shareTitle ?? recipe.name);
  const [isShared, setIsShared] = useState(recipe.isShared ?? false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handle = socialHandle;
  const ingredients = recipe.blend.ingredients
    .map((bi) => bi.ingredient.name)
    .join(" · ");

  const shareText = `✨ ${shareTitle}\nby @${handle}\n\n${recipe.blend.name}\n${ingredients}\n\n#oveninfusion #infusionstudio`;

  const previewRecipe: SharedRecipe = {
    ...recipe,
    shareTitle,
    isShared,
    user: { socialHandle: handle, name: "You" },
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/recipes/${recipe.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isShared, shareTitle }),
    });
    setSaving(false);
    onShared();
    onClose();
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share to Oven Infusion" className="max-w-lg">
      <div className="space-y-5">
        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-3 dark:from-emerald-900/20 dark:to-teal-900/20">
          <Instagram className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              @{handle}
            </p>
            <p className="text-xs text-stone-500">Share your recipe to the feed</p>
          </div>
        </div>

        <Input
          label="Post title"
          value={shareTitle}
          onChange={(e) => setShareTitle(e.target.value)}
          placeholder="e.g. My Cozy Evening Ritual"
        />

        {/* Preview */}
        <div className="scale-95 origin-top">
          <OvenInfusionCard recipe={previewRecipe} />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-200 p-3 dark:border-stone-700">
          <input
            type="checkbox"
            checked={isShared}
            onChange={(e) => setIsShared(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
          />
          <div>
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
              Publish to Oven Infusion feed
            </p>
            <p className="text-xs text-stone-500">
              Others can discover and get inspired by your recipe
            </p>
          </div>
        </label>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={copyCaption}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy IG caption"}
          </Button>
          <Button className="flex-1" onClick={handleSave} isLoading={saving}>
            <Share2 className="h-4 w-4" />
            Save & share
          </Button>
        </div>
      </div>
    </Modal>
  );
}
