import { z } from "zod";

export const brewLogSchema = z.object({
  blendId: z.string().min(1),
  recipeId: z.string().optional(),
  notes: z.string().max(500).optional(),
  brewedAt: z.coerce.date().optional(),
});

export type BrewLogInput = z.infer<typeof brewLogSchema>;

export const csvIngredientRowSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["TEA", "HERB", "SPICE", "FRUIT", "FLOWER", "OTHER"]),
  quantity: z.coerce.number().min(0).default(0),
  unit: z.string().default("g"),
  pricePerUnit: z.coerce.number().min(0).optional(),
});

export const ingredientImportSchema = z.object({
  ingredients: z.array(csvIngredientRowSchema).min(1).max(200),
});
