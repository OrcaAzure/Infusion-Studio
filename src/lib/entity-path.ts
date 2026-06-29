import { appPath } from "@/lib/app-path";

const offline = process.env.NEXT_PUBLIC_OFFLINE_DEMO === "true";

/** Detail route — offline APK uses query-param pages (static export has no runtime [id] HTML). */
export function ingredientPath(id: string) {
  if (offline) return appPath(`/ingredients/item?id=${encodeURIComponent(id)}`);
  return appPath(`/ingredients/${id}`);
}

export function ingredientEditPath(id: string) {
  if (offline) return appPath(`/ingredients/item/edit?id=${encodeURIComponent(id)}`);
  return appPath(`/ingredients/${id}/edit`);
}

export function blendPath(id: string) {
  if (offline) return appPath(`/blends/item?id=${encodeURIComponent(id)}`);
  return appPath(`/blends/${id}`);
}

export function blendEditPath(id: string) {
  if (offline) return appPath(`/blends/item/edit?id=${encodeURIComponent(id)}`);
  return appPath(`/blends/${id}/edit`);
}
