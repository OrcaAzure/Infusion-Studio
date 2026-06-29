import type { Ingredient } from "@prisma/client";
import { findPairings } from "@/lib/pairings";
import {
  createInitialDemoState,
  DEMO_USER_ID,
  type DemoState,
} from "./seed-data";
import { demoStorageGet, demoStorageSet } from "./preferences";

let state: DemoState = createInitialDemoState();

function normalizeState(raw: DemoState): DemoState {
  return { ...raw, brewLogs: raw.brewLogs ?? [] };
}

function touch() {
  if (typeof window !== "undefined") {
    void demoStorageSet(JSON.stringify(state));
  }
}

export function loadDemoState() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("infusion-studio-offline-demo");
    if (raw) state = normalizeState(JSON.parse(raw) as DemoState);
  } catch {
    state = createInitialDemoState();
  }
  void demoStorageGet().then((raw) => {
    if (raw) {
      try {
        state = normalizeState(JSON.parse(raw) as DemoState);
      } catch {
        /* keep prior */
      }
    }
  });
}

export function resetDemoState() {
  state = createInitialDemoState();
  touch();
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function ingredientById(id: string) {
  return state.ingredients.find((i) => i.id === id && i.userId === DEMO_USER_ID);
}

function blendById(id: string) {
  return state.blends.find((b) => b.id === id && b.userId === DEMO_USER_ID);
}

function recipeById(id: string) {
  return state.recipes.find((r) => r.id === id && r.userId === DEMO_USER_ID);
}

function blendIngredientsFor(blendId: string) {
  return state.blendIngredients
    .filter((bi) => bi.blendId === blendId)
    .sort((a, b) => a.order - b.order)
    .map((bi) => ({
      ...bi,
      ingredient: ingredientById(bi.ingredientId)!,
    }))
    .filter((bi) => bi.ingredient);
}

function blendWithIngredients(blendId: string) {
  const blend = blendById(blendId);
  if (!blend) return null;
  const ingredients = blendIngredientsFor(blendId);
  const recipeCount = state.recipes.filter((r) => r.blendId === blendId).length;
  const favoriteCount = state.favorites.filter((f) => f.blendId === blendId).length;
  return {
    ...blend,
    ingredients,
    _count: { recipes: recipeCount, favorites: favoriteCount },
  };
}

function recipeWithBlend(recipeId: string) {
  const recipe = recipeById(recipeId);
  if (!recipe) return null;
  const blend = blendWithIngredients(recipe.blendId);
  if (!blend) return null;
  return { ...recipe, blend };
}

function sharedRecipe(recipeId: string) {
  const recipe = recipeWithBlend(recipeId);
  if (!recipe?.isShared) return null;
  return {
    ...recipe,
    user: { socialHandle: state.user.socialHandle, name: state.user.name },
  };
}

const LOW_STOCK = 50;

export const offlineStore = {
  getDashboard() {
    const ingredients = state.ingredients.filter((i) => i.userId === DEMO_USER_ID);
    const blends = state.blends.filter((b) => b.userId === DEMO_USER_ID);
    const recipes = state.recipes.filter((r) => r.userId === DEMO_USER_ID);
    const favorites = state.favorites.filter((f) => f.userId === DEMO_USER_ID);

    const categoryMap = new Map<string, number>();
    for (const ing of ingredients) {
      categoryMap.set(ing.category, (categoryMap.get(ing.category) ?? 0) + 1);
    }

    return {
      totalIngredients: ingredients.length,
      totalBlends: blends.length,
      totalRecipes: recipes.length,
      favoriteCount: favorites.length,
      lowStockItems: [...ingredients]
        .filter((i) => i.quantity <= ((i as { lowStockThreshold?: number }).lowStockThreshold ?? 50))
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 5),
      recentBlends: [...blends]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5)
        .map((b) => blendWithIngredients(b.id)!)
        .filter(Boolean),
      categoryBreakdown: [...categoryMap.entries()].map(([category, count]) => ({
        category,
        count,
      })),
      totalInventoryValue: ingredients.reduce(
        (sum, i) => sum + i.quantity * (i.pricePerUnit ?? 0),
        0
      ),
    };
  },

  listIngredients(params: URLSearchParams) {
    const search = params.get("search") ?? "";
    const category = params.get("category") ?? "";
    const sortBy = (params.get("sortBy") ?? "name") as keyof (typeof state.ingredients)[0];
    const sortOrder = params.get("sortOrder") === "desc" ? -1 : 1;

    let items = state.ingredients.filter((i) => i.userId === DEMO_USER_ID);

    if (category) items = items.filter((i) => i.category === category);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }

    items = [...items].sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (typeof av === "string" && typeof bv === "string") {
        return av.localeCompare(bv) * sortOrder;
      }
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * sortOrder;
      }
      return 0;
    });

    return items.map((ingredient) => ({
      ...ingredient,
      _count: {
        blendItems: state.blendIngredients.filter((bi) => bi.ingredientId === ingredient.id)
          .length,
      },
    }));
  },

  getIngredient(id: string) {
    const ingredient = ingredientById(id);
    if (!ingredient) return null;

    const blendItems = state.blendIngredients
      .filter((bi) => bi.ingredientId === id)
      .map((bi) => {
        const blend = blendById(bi.blendId);
        return blend
          ? {
              ...bi,
              blend: { id: blend.id, name: blend.name, createdAt: blend.createdAt },
            }
          : null;
      })
      .filter(Boolean)
      .slice(0, 10);

    return {
      ...ingredient,
      blendItems,
      _count: { blendItems: state.blendIngredients.filter((bi) => bi.ingredientId === id).length },
    };
  },

  createIngredient(data: Record<string, unknown>) {
    const now = new Date().toISOString();
    const ingredient = {
      id: uid("ing"),
      name: String(data.name ?? ""),
      description: (data.description as string) ?? null,
      category: data.category as DemoState["ingredients"][0]["category"],
      origin: (data.origin as string) ?? null,
      flavorNotes: (data.flavorNotes as string[]) ?? [],
      quantity: Number(data.quantity ?? 0),
      unit: String(data.unit ?? "g"),
      pricePerUnit: data.pricePerUnit != null ? Number(data.pricePerUnit) : null,
      lowStockThreshold:
        data.lowStockThreshold != null ? Number(data.lowStockThreshold) : 50,
      imageUrl: (data.imageUrl as string) || null,
      userId: DEMO_USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    state.ingredients.push(ingredient);
    touch();
    return ingredient;
  },

  updateIngredient(id: string, data: Record<string, unknown>) {
    const idx = state.ingredients.findIndex((i) => i.id === id);
    if (idx < 0) return null;
    const now = new Date().toISOString();
    state.ingredients[idx] = {
      ...state.ingredients[idx],
      name: String(data.name ?? state.ingredients[idx].name),
      description: (data.description as string) ?? state.ingredients[idx].description,
      category: (data.category as DemoState["ingredients"][0]["category"]) ?? state.ingredients[idx].category,
      origin: (data.origin as string) ?? state.ingredients[idx].origin,
      flavorNotes: (data.flavorNotes as string[]) ?? state.ingredients[idx].flavorNotes,
      quantity: Number(data.quantity ?? state.ingredients[idx].quantity),
      unit: String(data.unit ?? state.ingredients[idx].unit),
      pricePerUnit:
        data.pricePerUnit != null
          ? Number(data.pricePerUnit)
          : state.ingredients[idx].pricePerUnit,
      imageUrl: (data.imageUrl as string) || null,
      updatedAt: now,
    };
    touch();
    return state.ingredients[idx];
  },

  deleteIngredient(id: string) {
    state.ingredients = state.ingredients.filter((i) => i.id !== id);
    state.blendIngredients = state.blendIngredients.filter((bi) => bi.ingredientId !== id);
    touch();
    return true;
  },

  adjustStock(id: string, delta: number) {
    const idx = state.ingredients.findIndex((i) => i.id === id);
    if (idx < 0) return null;
    state.ingredients[idx] = {
      ...state.ingredients[idx],
      quantity: Math.max(0, state.ingredients[idx].quantity + delta),
      updatedAt: new Date().toISOString(),
    };
    touch();
    return state.ingredients[idx];
  },

  getPairings(id: string) {
    const target = ingredientById(id);
    if (!target) return null;
    const all = state.ingredients.filter((i) => i.userId === DEMO_USER_ID);
    return findPairings(target as unknown as Ingredient, all as unknown as Ingredient[]);
  },

  listBlends(search: string) {
    let blends = state.blends.filter((b) => b.userId === DEMO_USER_ID);
    if (search) {
      const q = search.toLowerCase();
      blends = blends.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.description ?? "").toLowerCase().includes(q)
      );
    }
    return blends
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((b) => blendWithIngredients(b.id)!)
      .filter(Boolean);
  },

  getBlend(id: string) {
    const blend = blendWithIngredients(id);
    if (!blend) return null;
    const recipes = state.recipes
      .filter((r) => r.blendId === id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const favorites = state.favorites.filter(
      (f) => f.blendId === id && f.userId === DEMO_USER_ID
    );
    return { ...blend, recipes, favorites };
  },

  createBlend(data: Record<string, unknown>) {
    const now = new Date().toISOString();
    const id = uid("blend");
    const blend = {
      id,
      name: String(data.name ?? ""),
      description: (data.description as string) ?? null,
      brewTemp: data.brewTemp != null ? Number(data.brewTemp) : null,
      brewTime: data.brewTime != null ? Number(data.brewTime) : null,
      userId: DEMO_USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    state.blends.push(blend);

    const ingredients = (data.ingredients as Array<Record<string, unknown>>) ?? [];
    ingredients.forEach((ing, index) => {
      state.blendIngredients.push({
        id: uid("bi"),
        blendId: id,
        ingredientId: String(ing.ingredientId),
        amount: Number(ing.amount),
        unit: String(ing.unit ?? "g"),
        order: Number(ing.order ?? index),
      });
    });
    touch();
    return blendWithIngredients(id);
  },

  updateBlend(id: string, data: Record<string, unknown>) {
    const blend = blendById(id);
    if (!blend) return null;
    const now = new Date().toISOString();
    blend.name = String(data.name ?? blend.name);
    blend.description = (data.description as string) ?? blend.description;
    blend.brewTemp = data.brewTemp != null ? Number(data.brewTemp) : blend.brewTemp;
    blend.brewTime = data.brewTime != null ? Number(data.brewTime) : blend.brewTime;
    blend.updatedAt = now;

    state.blendIngredients = state.blendIngredients.filter((bi) => bi.blendId !== id);
    const ingredients = (data.ingredients as Array<Record<string, unknown>>) ?? [];
    ingredients.forEach((ing, index) => {
      state.blendIngredients.push({
        id: uid("bi"),
        blendId: id,
        ingredientId: String(ing.ingredientId),
        amount: Number(ing.amount),
        unit: String(ing.unit ?? "g"),
        order: Number(ing.order ?? index),
      });
    });
    touch();
    return blendWithIngredients(id);
  },

  deleteBlend(id: string) {
    state.blends = state.blends.filter((b) => b.id !== id);
    state.blendIngredients = state.blendIngredients.filter((bi) => bi.blendId !== id);
    state.recipes = state.recipes.filter((r) => r.blendId !== id);
    state.favorites = state.favorites.filter((f) => f.blendId !== id);
    state.brewLogs = state.brewLogs.filter((l) => l.blendId !== id);
    touch();
    return true;
  },

  listRecipes() {
    return state.recipes
      .filter((r) => r.userId === DEMO_USER_ID)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((r) => recipeWithBlend(r.id)!)
      .filter(Boolean);
  },

  createRecipe(data: Record<string, unknown>) {
    const now = new Date().toISOString();
    const recipe = {
      id: uid("recipe"),
      name: String(data.name ?? ""),
      shareTitle: null,
      notes: (data.notes as string) ?? null,
      rating: data.rating != null ? Number(data.rating) : null,
      brewCount: 0,
      lastBrewed: null,
      isShared: false,
      isFeatured: false,
      blendId: String(data.blendId),
      userId: DEMO_USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    state.recipes.push(recipe);
    touch();
    return recipeWithBlend(recipe.id);
  },

  updateRecipe(id: string, data: Record<string, unknown>) {
    const recipe = recipeById(id);
    if (!recipe) return null;
    const now = new Date().toISOString();
    if (data.notes !== undefined) recipe.notes = data.notes as string;
    if (data.rating !== undefined) recipe.rating = Number(data.rating);
    if (data.brewCount !== undefined) recipe.brewCount = Number(data.brewCount);
    if (data.lastBrewed !== undefined) recipe.lastBrewed = String(data.lastBrewed);
    if (data.isShared !== undefined) recipe.isShared = Boolean(data.isShared);
    if (data.shareTitle !== undefined) recipe.shareTitle = data.shareTitle as string;
    if (data.isFeatured !== undefined) recipe.isFeatured = Boolean(data.isFeatured);
    recipe.updatedAt = now;
    touch();
    return recipeWithBlend(id);
  },

  deleteRecipe(id: string) {
    state.recipes = state.recipes.filter((r) => r.id !== id);
    state.brewLogs = state.brewLogs.map((l) =>
      l.recipeId === id ? { ...l, recipeId: null } : l
    );
    touch();
    return true;
  },

  listFavorites() {
    return state.favorites
      .filter((f) => f.userId === DEMO_USER_ID)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((f) => {
        const blend = blendWithIngredients(f.blendId);
        if (!blend) return null;
        return {
          ...f,
          blend: {
            ...blend,
            _count: { recipes: state.recipes.filter((r) => r.blendId === f.blendId).length },
          },
        };
      })
      .filter(Boolean);
  },

  addFavorite(blendId: string) {
    if (!blendById(blendId)) return null;
    if (!state.favorites.some((f) => f.userId === DEMO_USER_ID && f.blendId === blendId)) {
      state.favorites.push({
        userId: DEMO_USER_ID,
        blendId,
        createdAt: new Date().toISOString(),
      });
      touch();
    }
    const blend = blendWithIngredients(blendId);
    return { userId: DEMO_USER_ID, blendId, createdAt: new Date().toISOString(), blend };
  },

  removeFavorite(blendId: string) {
    state.favorites = state.favorites.filter(
      (f) => !(f.userId === DEMO_USER_ID && f.blendId === blendId)
    );
    touch();
    return true;
  },

  getDiscover() {
    const shared = state.recipes
      .filter((r) => r.isShared)
      .map((r) => sharedRecipe(r.id)!)
      .filter(Boolean);
    const featured = shared
      .filter((r) => r.isFeatured)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 6);
    const community = [...shared].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return { featured, community };
  },

  getProfile() {
    return {
      socialHandle: state.user.socialHandle,
      name: state.user.name,
      email: state.user.email,
    };
  },

  updateProfile(data: Record<string, unknown>) {
    const handle = String(data.socialHandle ?? "")
      .replace(/^@/, "")
      .toLowerCase()
      .trim();
    if (handle.length < 3) return { error: "Handle must be at least 3 characters", status: 400 };
    state.user.socialHandle = handle;
    touch();
    return { socialHandle: state.user.socialHandle, name: state.user.name };
  },

  listBrewLogs(params: URLSearchParams) {
    const recipeId = params.get("recipeId");
    const blendId = params.get("blendId");
    let logs = state.brewLogs.filter((l) => l.userId === DEMO_USER_ID);
    if (recipeId) logs = logs.filter((l) => l.recipeId === recipeId);
    if (blendId) logs = logs.filter((l) => l.blendId === blendId);
    return logs
      .sort((a, b) => b.brewedAt.localeCompare(a.brewedAt))
      .slice(0, 50)
      .map((log) => {
        const blend = blendById(log.blendId);
        const recipe = log.recipeId ? recipeById(log.recipeId) : null;
        return {
          ...log,
          blend: blend ? { id: blend.id, name: blend.name } : undefined,
          recipe: recipe ? { id: recipe.id, name: recipe.name } : null,
        };
      });
  },

  createBrewLog(data: Record<string, unknown>) {
    const blendId = String(data.blendId ?? "");
    const recipeId = data.recipeId ? String(data.recipeId) : null;
    if (!blendById(blendId)) return null;

    if (recipeId && !recipeById(recipeId)) return null;

    const brewedAt = data.brewedAt
      ? new Date(String(data.brewedAt)).toISOString()
      : new Date().toISOString();

    const log = {
      id: uid("log"),
      notes: (data.notes as string) ?? null,
      brewedAt,
      userId: DEMO_USER_ID,
      blendId,
      recipeId,
    };
    state.brewLogs.push(log);

    if (recipeId) {
      const recipe = recipeById(recipeId);
      if (recipe) {
        recipe.brewCount += 1;
        recipe.lastBrewed = brewedAt;
        recipe.updatedAt = brewedAt;
      }
    }

    touch();
    const blend = blendById(blendId)!;
    const recipe = recipeId ? recipeById(recipeId) : null;
    return {
      ...log,
      blend: { id: blend.id, name: blend.name },
      recipe: recipe ? { id: recipe.id, name: recipe.name } : null,
    };
  },

  importIngredients(rows: Array<Record<string, unknown>>) {
    const created = rows.map((data) => this.createIngredient(data));
    return { imported: created.length, ingredients: created };
  },
};
