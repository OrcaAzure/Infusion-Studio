"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import {
  ingredientSchema,
  ingredientCategories,
  ingredientUnits,
  type IngredientInput,
} from "@/lib/validations/ingredient";
import { CATEGORY_LABELS, parseFlavorNotes } from "@/lib/utils";
import { appPath } from "@/lib/app-path";
import { ingredientPath } from "@/lib/entity-path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { NumberInput } from "@/components/ui/number-input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import type { Ingredient } from "@prisma/client";

interface IngredientFormProps {
  ingredient?: Ingredient;
  onSuccess?: () => void;
}

const ORIGIN_SUGGESTIONS = ["China", "Japan", "India", "Sri Lanka", "Taiwan", "Kenya", "Nepal"];

export function IngredientForm({ ingredient, onSuccess }: IngredientFormProps) {
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const isEditing = !!ingredient;
  const [flavorNotes, setFlavorNotes] = useState<string[]>(
    ingredient ? parseFlavorNotes(ingredient.flavorNotes) : []
  );
  const [newNote, setNewNote] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<IngredientInput>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: ingredient
      ? {
          name: ingredient.name,
          description: ingredient.description ?? "",
          category: ingredient.category,
          origin: ingredient.origin ?? "",
          flavorNotes: ingredient ? parseFlavorNotes(ingredient.flavorNotes) : [],
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          pricePerUnit: ingredient.pricePerUnit ?? undefined,
          lowStockThreshold: ingredient.lowStockThreshold ?? 50,
          imageUrl: ingredient.imageUrl ?? "",
        }
      : {
          category: "TEA",
          quantity: 0,
          unit: "g",
          lowStockThreshold: 50,
          flavorNotes: [],
        },
  });

  const addNote = () => {
    const trimmed = newNote.trim();
    if (trimmed && !flavorNotes.includes(trimmed)) {
      setFlavorNotes([...flavorNotes, trimmed]);
      setNewNote("");
    }
  };

  const removeNote = (note: string) => {
    setFlavorNotes(flavorNotes.filter((n) => n !== note));
  };

  const onSubmit = async (data: IngredientInput) => {
    const payload = { ...data, flavorNotes };
    const url = isEditing ? `/api/ingredients/${ingredient.id}` : "/api/ingredients";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast("Failed to save - please try again");
      return;
    }

    const saved = isEditing ? ingredient : await res.json();
    toast(isEditing ? "Changes saved" : "Ingredient added");
    onSuccess?.();
    router.push(ingredientPath(isEditing ? ingredient.id : saved.id));
  };

  const handleCancel = () => {
    if (isEditing && isDirty) {
      setShowCancelModal(true);
      return;
    }
    router.back();
  };

  const categoryOptions = ingredientCategories.map((c) => ({
    value: c,
    label: CATEGORY_LABELS[c],
  }));

  const unitOptions = ingredientUnits.map((u) => ({ value: u, label: u }));

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="name"
            label="Name"
            placeholder="Sencha Green Tea"
            error={errors.name?.message}
            {...register("name")}
          />
          <Select
            id="category"
            label="Category"
            options={categoryOptions}
            error={errors.category?.message}
            {...register("category")}
          />
        </div>

        <Textarea
          id="description"
          label="Description"
          placeholder="Describe the ingredient's characteristics..."
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Input
              id="origin"
              label="Origin"
              placeholder="Japan"
              list="origin-suggestions"
              error={errors.origin?.message}
              {...register("origin")}
            />
            <datalist id="origin-suggestions">
              {ORIGIN_SUGGESTIONS.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </div>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Quantity"
                value={field.value}
                onChange={field.onChange}
                min={0}
                step={1}
              />
            )}
          />
          <Select
            id="unit"
            label="Unit"
            options={unitOptions}
            error={errors.unit?.message}
            {...register("unit")}
          />
        </div>

        <Controller
          name="lowStockThreshold"
          control={control}
          render={({ field }) => (
            <NumberInput
              label="Low stock alert threshold (optional)"
              value={field.value ?? 50}
              onChange={field.onChange}
              min={1}
              max={99999}
              step={1}
            />
          )}
        />

        <Controller
          name="pricePerUnit"
          control={control}
          render={({ field }) => (
            <NumberInput
              label="Price per unit ($)"
              value={field.value ?? 0}
              onChange={field.onChange}
              min={0}
              step={0.01}
              error={errors.pricePerUnit?.message}
            />
          )}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Flavor notes
          </label>
          <div className="flex flex-wrap gap-2">
            {flavorNotes.map((note) => (
              <span
                key={note}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                {note}
                <button type="button" onClick={() => removeNote(note)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Input
              placeholder="e.g. grassy, floral"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNote())}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={addNote}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" isLoading={isSubmitting} disabled={isEditing && !isDirty}>
            {isEditing ? "Save changes" : "Add ingredient"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>

      <ConfirmModal
        isOpen={showCancelModal}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to leave?"
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        variant="danger"
        onCancel={() => setShowCancelModal(false)}
        onConfirm={() => router.back()}
      />
    </>
  );
}