import type { IngredientCategory } from "@prisma/client";

export const DEMO_USER_ID = "demo-user";
export const DEMO_BLEND_ID = "seed-blend-1";

export const DEMO_INGREDIENT_IDS = [
  "seed-ing-1",
  "seed-ing-2",
  "seed-ing-3",
  "seed-ing-4",
  "seed-ing-5",
  "seed-ing-6",
] as const;

export const DEMO_BLEND_IDS = [DEMO_BLEND_ID] as const;

type DemoIngredient = {
  id: string;
  name: string;
  description: string | null;
  category: IngredientCategory;
  origin: string | null;
  flavorNotes: string[];
  quantity: number;
  unit: string;
  pricePerUnit: number | null;
  imageUrl: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type DemoBlend = {
  id: string;
  name: string;
  description: string | null;
  brewTemp: number | null;
  brewTime: number | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type DemoBlendIngredient = {
  id: string;
  blendId: string;
  ingredientId: string;
  amount: number;
  unit: string;
  order: number;
};

type DemoRecipe = {
  id: string;
  name: string;
  shareTitle: string | null;
  notes: string | null;
  rating: number | null;
  brewCount: number;
  lastBrewed: string | null;
  isShared: boolean;
  isFeatured: boolean;
  blendId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type DemoFavorite = {
  userId: string;
  blendId: string;
  createdAt: string;
};

export type DemoState = {
  user: {
    id: string;
    name: string;
    email: string;
    socialHandle: string;
  };
  ingredients: DemoIngredient[];
  blends: DemoBlend[];
  blendIngredients: DemoBlendIngredient[];
  recipes: DemoRecipe[];
  favorites: DemoFavorite[];
};

const now = new Date().toISOString();

function ing(
  id: string,
  name: string,
  description: string,
  category: IngredientCategory,
  origin: string,
  flavorNotes: string[],
  quantity: number,
  pricePerUnit: number
): DemoIngredient {
  return {
    id,
    name,
    description,
    category,
    origin,
    flavorNotes,
    quantity,
    unit: "g",
    pricePerUnit,
    imageUrl: null,
    userId: DEMO_USER_ID,
    createdAt: now,
    updatedAt: now,
  };
}

export function createInitialDemoState(): DemoState {
  const ingredients: DemoIngredient[] = [
    ing("seed-ing-1", "Sencha Green Tea", "Classic Japanese green tea with grassy, umami notes.", "TEA", "Japan", ["grassy", "umami", "vegetal"], 250, 0.08),
    ing("seed-ing-2", "Chamomile Flowers", "Dried chamomile blossoms for calming herbal infusions.", "FLOWER", "Egypt", ["floral", "honey", "apple"], 100, 0.12),
    ing("seed-ing-3", "Fresh Ginger Root", "Warming spice with bright, peppery heat.", "SPICE", "India", ["spicy", "warm", "citrus"], 150, 0.05),
    ing("seed-ing-4", "Dried Lavender", "Fragrant purple buds for aromatic blends.", "FLOWER", "France", ["floral", "herbal", "sweet"], 50, 0.15),
    ing("seed-ing-5", "Peppermint Leaves", "Cooling mint for refreshing infusions.", "HERB", "USA", ["cool", "minty", "fresh"], 80, 0.1),
    ing("seed-ing-6", "Dried Orange Peel", "Bright citrus zest for uplifting blends.", "FRUIT", "Spain", ["citrus", "sweet", "bright"], 60, 0.09),
  ];

  const blends: DemoBlend[] = [
    {
      id: DEMO_BLEND_ID,
      name: "Calm Evening Blend",
      description: "A soothing mix of chamomile, lavender, and mint.",
      brewTemp: 90,
      brewTime: 300,
      userId: DEMO_USER_ID,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const blendIngredients: DemoBlendIngredient[] = [
    { id: "bi-1", blendId: DEMO_BLEND_ID, ingredientId: "seed-ing-2", amount: 3, unit: "g", order: 0 },
    { id: "bi-2", blendId: DEMO_BLEND_ID, ingredientId: "seed-ing-4", amount: 1, unit: "g", order: 1 },
    { id: "bi-3", blendId: DEMO_BLEND_ID, ingredientId: "seed-ing-5", amount: 2, unit: "g", order: 2 },
  ];

  const recipes: DemoRecipe[] = [
    {
      id: "seed-recipe-1",
      name: "My Evening Ritual",
      shareTitle: "Midnight Calm Ritual",
      notes: "Perfect before bed. Steep covered for 5 minutes.",
      rating: 5,
      brewCount: 12,
      lastBrewed: now,
      isShared: true,
      isFeatured: true,
      blendId: DEMO_BLEND_ID,
      userId: DEMO_USER_ID,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-recipe-2",
      name: "Morning Sencha",
      shareTitle: "Golden Hour Glow",
      notes: "Light and grassy. Perfect for slow mornings.",
      rating: 4,
      brewCount: 8,
      lastBrewed: null,
      isShared: true,
      isFeatured: true,
      blendId: DEMO_BLEND_ID,
      userId: DEMO_USER_ID,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    user: {
      id: DEMO_USER_ID,
      name: "Trial User",
      email: "trial@trial.com",
      socialHandle: "oven_infusion",
    },
    ingredients,
    blends,
    blendIngredients,
    recipes,
    favorites: [{ userId: DEMO_USER_ID, blendId: DEMO_BLEND_ID, createdAt: now }],
  };
}
