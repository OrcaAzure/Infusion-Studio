import type { Ingredient } from "@prisma/client";

/** How well ingredient categories pair in infusions (0–1) */
const CATEGORY_AFFINITY: Record<string, Record<string, number>> = {
  TEA: { HERB: 0.92, FLOWER: 0.88, FRUIT: 0.85, SPICE: 0.72, TEA: 0.35, OTHER: 0.55 },
  HERB: { FLOWER: 0.95, TEA: 0.9, FRUIT: 0.78, SPICE: 0.65, HERB: 0.4, OTHER: 0.6 },
  SPICE: { TEA: 0.8, FRUIT: 0.88, HERB: 0.7, FLOWER: 0.55, SPICE: 0.3, OTHER: 0.5 },
  FRUIT: { TEA: 0.85, HERB: 0.75, SPICE: 0.82, FLOWER: 0.7, FRUIT: 0.35, OTHER: 0.55 },
  FLOWER: { HERB: 0.95, TEA: 0.88, FRUIT: 0.72, SPICE: 0.5, FLOWER: 0.3, OTHER: 0.55 },
  OTHER: { TEA: 0.6, HERB: 0.65, FRUIT: 0.6, SPICE: 0.55, FLOWER: 0.6, OTHER: 0.4 },
};

/** Flavor notes that complement each other */
const FLAVOR_COMPLEMENTS: Record<string, string[]> = {
  grassy: ["citrus", "floral", "minty", "sweet"],
  umami: ["spicy", "citrus", "warm"],
  vegetal: ["citrus", "floral", "minty"],
  floral: ["honey", "citrus", "sweet", "apple", "minty"],
  honey: ["floral", "spicy", "citrus", "warm"],
  apple: ["cinnamon", "spicy", "floral", "sweet"],
  spicy: ["citrus", "sweet", "warm", "honey"],
  warm: ["spicy", "citrus", "floral", "sweet"],
  citrus: ["spicy", "floral", "minty", "sweet", "grassy"],
  sweet: ["floral", "spicy", "citrus", "warm"],
  cool: ["citrus", "minty", "floral"],
  minty: ["citrus", "floral", "cool", "sweet"],
  fresh: ["citrus", "grassy", "floral"],
  bright: ["spicy", "floral", "sweet"],
  herbal: ["floral", "citrus", "warm"],
};

export interface PairingResult {
  ingredient: Ingredient;
  score: number;
  reasons: string[];
}

function parseFlavorNotes(notes: unknown): string[] {
  if (Array.isArray(notes)) return notes.map(String);
  return [];
}

/** Score how well two ingredients pair together */
export function scorePairing(a: Ingredient, b: Ingredient): { score: number; reasons: string[] } {
  if (a.id === b.id) return { score: 0, reasons: [] };

  const reasons: string[] = [];
  let score = CATEGORY_AFFINITY[a.category]?.[b.category] ?? 0.4;

  if (score >= 0.85) {
    reasons.push(`${a.category.toLowerCase()} + ${b.category.toLowerCase()} classic pairing`);
  } else if (score >= 0.7) {
    reasons.push("Complementary categories");
  }

  const notesA = parseFlavorNotes(a.flavorNotes);
  const notesB = parseFlavorNotes(b.flavorNotes);

  for (const noteA of notesA) {
    const complements = FLAVOR_COMPLEMENTS[noteA.toLowerCase()] ?? [];
    for (const noteB of notesB) {
      const lowerB = noteB.toLowerCase();
      if (complements.includes(lowerB)) {
        score += 0.12;
        reasons.push(`${noteA} pairs beautifully with ${noteB}`);
      }
      if (noteA.toLowerCase() === lowerB) {
        score += 0.05;
        reasons.push(`Shared ${noteA} notes harmonize`);
      }
    }
  }

  // Same origin bonus
  if (a.origin && b.origin && a.origin === b.origin) {
    score += 0.08;
    reasons.push(`Both from ${a.origin}`);
  }

  return { score: Math.min(score, 1), reasons: [...new Set(reasons)].slice(0, 3) };
}

/** Find best pairing partners from a list of ingredients */
export function findPairings(
  target: Ingredient,
  allIngredients: Ingredient[],
  limit = 5
): PairingResult[] {
  return allIngredients
    .filter((ing) => ing.id !== target.id)
    .map((ingredient) => {
      const { score, reasons } = scorePairing(target, ingredient);
      return { ingredient, score, reasons };
    })
    .filter((p) => p.score >= 0.55)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
