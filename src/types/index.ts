import type { Ingredient, Blend, BlendIngredient, Recipe, FavoriteBlend } from "@prisma/client";

export type IngredientWithMeta = Ingredient & {
  _count?: { blendItems: number };
};

export type BlendIngredientWithDetails = BlendIngredient & {
  ingredient: Ingredient;
};

export type BlendWithIngredients = Blend & {
  ingredients: BlendIngredientWithDetails[];
  _count?: { recipes: number; favorites: number };
};

export type RecipeWithBlend = Recipe & {
  blend: BlendWithIngredients;
};

export type SharedRecipe = RecipeWithBlend & {
  user: { socialHandle: string | null; name: string | null };
  _count?: { recipeLikes: number };
  liked?: boolean;
};

export type FavoriteWithBlend = FavoriteBlend & {
  blend: BlendWithIngredients;
};

export interface DashboardStats {
  totalIngredients: number;
  totalBlends: number;
  totalRecipes: number;
  favoriteCount: number;
  lowStockItems: Ingredient[];
  recentBlends: BlendWithIngredients[];
  categoryBreakdown: { category: string; count: number }[];
  totalInventoryValue: number;
  brewStreak: number;
  totalBrewsThisWeek: number;
}

export interface BlendCanvasItem {
  ingredientId: string;
  name: string;
  category: string;
  amount: number;
  unit: string;
  order: number;
  flavorNotes: string[];
}

export type BrewLogEntry = {
  id: string;
  notes: string | null;
  brewedAt: string;
  blendId: string;
  recipeId: string | null;
  blend?: { id: string; name: string };
  recipe?: { id: string; name: string } | null;
};
