import { z } from "zod";

export const ingredientUnits = ["g", "oz", "ml", "L", "tsp", "tbsp", "cup", "pcs", "bag"] as const;

export const ingredientCategories = [
  "TEA",
  "HERB",
  "SPICE",
  "FRUIT",
  "FLOWER",
  "OTHER",
] as const;

export const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  category: z.enum(ingredientCategories),
  origin: z.string().max(100).optional(),
  flavorNotes: z.array(z.string()),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  unit: z.string().min(1),
  lowStockThreshold: z.coerce.number().min(1).max(99999).optional(),
  pricePerUnit: z.coerce.number().min(0).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const ingredientFilterSchema = z.object({
  search: z.string().optional(),
  category: z.enum(ingredientCategories).optional(),
  sortBy: z.enum(["name", "quantity", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type IngredientInput = z.infer<typeof ingredientSchema>;
export type IngredientFilter = z.infer<typeof ingredientFilterSchema>;
