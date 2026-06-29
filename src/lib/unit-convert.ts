/** Common tea/herb unit equivalents for blend canvas display */
const TSP_TO_G = 2.5;
const TBSP_TO_G = 7.5;

export type ConvertibleUnit = "g" | "tsp" | "tbsp";

export function isConvertibleUnit(unit: string): unit is ConvertibleUnit {
  return unit === "g" || unit === "tsp" || unit === "tbsp";
}

export function convertAmount(
  amount: number,
  from: ConvertibleUnit,
  to: ConvertibleUnit
): number {
  if (from === to) return amount;
  const toGrams: Record<ConvertibleUnit, number> = {
    g: 1,
    tsp: TSP_TO_G,
    tbsp: TBSP_TO_G,
  };
  const grams = amount * toGrams[from];
  return Math.round((grams / toGrams[to]) * 10) / 10;
}

export function alternateUnit(unit: string): ConvertibleUnit | null {
  if (unit === "g") return "tsp";
  if (unit === "tsp") return "g";
  if (unit === "tbsp") return "g";
  return null;
}

export function unitHint(from: string, to: string): string {
  if (from === "g" && to === "tsp") return "1 tsp ≈ 2.5 g";
  if (from === "tsp" && to === "g") return "1 tsp ≈ 2.5 g";
  if (from === "tbsp" && to === "g") return "1 tbsp ≈ 7.5 g";
  return "";
}
