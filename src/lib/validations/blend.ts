import { z } from "zod";

export const blendIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  unit: z.string().default("g"),
  order: z.number().int().default(0),
});

export const blendSchema = z.object({
  name: z.string().min(1, "Blend name is required").max(100),
  description: z.string().max(500).optional(),
  brewTemp: z.coerce.number().min(50).max(100).optional(),
  brewTime: z.coerce.number().min(30).max(3600).optional(),
  ingredients: z
    .array(blendIngredientSchema)
    .min(1, "Add at least one ingredient to your blend"),
});

export const recipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required").max(100),
  notes: z.string().max(1000).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  blendId: z.string().min(1),
});

export type BlendInput = z.infer<typeof blendSchema>;
export type BlendIngredientInput = z.infer<typeof blendIngredientSchema>;
export type RecipeInput = z.infer<typeof recipeSchema>;
