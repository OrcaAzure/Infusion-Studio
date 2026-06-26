"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import {
  ingredientSchema,
  ingredientCategories,
  type IngredientInput,
} from "@/lib/validations/ingredient";
import { CATEGORY_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { Ingredient } from "@prisma/client";

interface IngredientFormProps {
  ingredient?: Ingredient;
  onSuccess?: () => void;
}

export function IngredientForm({ ingredient, onSuccess }: IngredientFormProps) {
  const router = useRouter();
  const isEditing = !!ingredient;
  const [flavorNotes, setFlavorNotes] = useState<string[]>(
    ingredient?.flavorNotes ?? []
  );
  const [newNote, setNewNote] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IngredientInput>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: ingredient
      ? {
          name: ingredient.name,
          description: ingredient.description ?? "",
          category: ingredient.category,
          origin: ingredient.origin ?? "",
          flavorNotes: ingredient.flavorNotes,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          pricePerUnit: ingredient.pricePerUnit ?? undefined,
          imageUrl: ingredient.imageUrl ?? "",
        }
      : {
          category: "TEA",
          quantity: 0,
          unit: "g",
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

    if (!res.ok) return;

    onSuccess?.();
    router.push(isEditing ? `/ingredients/${ingredient.id}` : "/ingredients");
    router.refresh();
  };

  const categoryOptions = ingredientCategories.map((c) => ({
    value: c,
    label: CATEGORY_LABELS[c],
  }));

  return (
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
        <Input
          id="origin"
          label="Origin"
          placeholder="Japan"
          error={errors.origin?.message}
          {...register("origin")}
        />
        <Input
          id="quantity"
          label="Quantity"
          type="number"
          step="0.1"
          error={errors.quantity?.message}
          {...register("quantity")}
        />
        <Input
          id="unit"
          label="Unit"
          placeholder="g"
          error={errors.unit?.message}
          {...register("unit")}
        />
      </div>

      <Input
        id="pricePerUnit"
        label="Price per unit ($)"
        type="number"
        step="0.01"
        placeholder="0.08"
        error={errors.pricePerUnit?.message}
        {...register("pricePerUnit")}
      />

      {/* Flavor notes — managed as local state for simplicity */}
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
        <div className="flex gap-2">
          <Input
            placeholder="e.g. grassy, floral"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNote())}
          />
          <Button type="button" variant="outline" size="sm" onClick={addNote}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Save changes" : "Add ingredient"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
