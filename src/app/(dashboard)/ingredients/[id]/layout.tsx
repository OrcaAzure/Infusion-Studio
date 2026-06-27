import { DEMO_INGREDIENT_IDS } from "@/lib/offline-demo/static-params";

export function generateStaticParams() {
  return DEMO_INGREDIENT_IDS.map((id) => ({ id }));
}

export default function IngredientIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
