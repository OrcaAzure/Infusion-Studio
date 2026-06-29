import { loadDemoState, offlineStore } from "./store";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseUrl(input: string) {
  try {
    const u = new URL(input, "http://offline.local");
    // Capacitor WebView may use https://localhost/... — normalize pathname
    return u;
  } catch {
    return new URL(`http://offline.local${input.startsWith("/") ? input : `/${input}`}`);
  }
}

export async function handleOfflineRequest(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  loadDemoState();

  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const parsed = parseUrl(url);
  const path = parsed.pathname.replace(/\/$/, "") || "/";

  let body: Record<string, unknown> = {};
  if (method !== "GET" && method !== "HEAD") {
    try {
      const raw = init?.body ?? (input instanceof Request ? await input.clone().text() : "");
      if (typeof raw === "string" && raw) body = JSON.parse(raw);
      else if (raw instanceof ReadableStream) {
        const text = await new Response(raw).text();
        if (text) body = JSON.parse(text);
      }
    } catch {
      body = {};
    }
  }

  // Dashboard
  if (path === "/api/dashboard" && method === "GET") {
    return json(offlineStore.getDashboard());
  }

  // Ingredients collection
  if (path === "/api/ingredients" && method === "GET") {
    return json(offlineStore.listIngredients(parsed.searchParams));
  }
  if (path === "/api/ingredients" && method === "POST") {
    return json(offlineStore.createIngredient(body), 201);
  }
  if (path === "/api/ingredients/import" && method === "POST") {
    const rows = (body.ingredients as Array<Record<string, unknown>>) ?? [];
    if (!rows.length) return json({ error: "No ingredients to import" }, 400);
    return json(offlineStore.importIngredients(rows), 201);
  }

  const stockMatch = path.match(/^\/api\/ingredients\/([^/]+)\/stock$/);
  if (stockMatch && method === "POST") {
    const item = offlineStore.adjustStock(stockMatch[1], Number(body.delta ?? 0));
    return item ? json(item) : json({ error: "Ingredient not found" }, 404);
  }

  // Ingredient by id
  const ingMatch = path.match(/^\/api\/ingredients\/([^/]+)$/);
  if (ingMatch) {
    const id = ingMatch[1];
    if (method === "GET") {
      const item = offlineStore.getIngredient(id);
      return item ? json(item) : json({ error: "Ingredient not found" }, 404);
    }
    if (method === "PUT") {
      const item = offlineStore.updateIngredient(id, body);
      return item ? json(item) : json({ error: "Ingredient not found" }, 404);
    }
    if (method === "DELETE") {
      offlineStore.deleteIngredient(id);
      return json({ success: true });
    }
  }

  const pairingMatch = path.match(/^\/api\/ingredients\/([^/]+)\/pairings$/);
  if (pairingMatch && method === "GET") {
    const pairings = offlineStore.getPairings(pairingMatch[1]);
    return pairings ? json(pairings) : json({ error: "Ingredient not found" }, 404);
  }

  // Blends
  if (path === "/api/blends" && method === "GET") {
    const search = parsed.searchParams.get("search") ?? "";
    return json(offlineStore.listBlends(search));
  }
  if (path === "/api/blends" && method === "POST") {
    return json(offlineStore.createBlend(body), 201);
  }

  const blendMatch = path.match(/^\/api\/blends\/([^/]+)$/);
  if (blendMatch) {
    const id = blendMatch[1];
    if (method === "GET") {
      const item = offlineStore.getBlend(id);
      return item ? json(item) : json({ error: "Blend not found" }, 404);
    }
    if (method === "PUT") {
      const item = offlineStore.updateBlend(id, body);
      return item ? json(item) : json({ error: "Blend not found" }, 404);
    }
    if (method === "DELETE") {
      offlineStore.deleteBlend(id);
      return json({ success: true });
    }
  }

  // Recipes
  if (path === "/api/recipes" && method === "GET") {
    return json(offlineStore.listRecipes());
  }
  if (path === "/api/recipes" && method === "POST") {
    const item = offlineStore.createRecipe(body);
    return item ? json(item, 201) : json({ error: "Blend not found" }, 404);
  }

  const recipeMatch = path.match(/^\/api\/recipes\/([^/]+)$/);
  if (recipeMatch) {
    const id = recipeMatch[1];
    if (method === "PATCH") {
      const item = offlineStore.updateRecipe(id, body);
      return item ? json(item) : json({ error: "Recipe not found" }, 404);
    }
    if (method === "PUT") {
      const item = offlineStore.updateRecipe(id, body);
      return item ? json(item) : json({ error: "Recipe not found" }, 404);
    }
    if (method === "DELETE") {
      offlineStore.deleteRecipe(id);
      return json({ success: true });
    }
  }

  // Favorites
  if (path === "/api/favorites" && method === "GET") {
    return json(offlineStore.listFavorites());
  }
  if (path === "/api/favorites" && method === "POST") {
    const item = offlineStore.addFavorite(String(body.blendId ?? ""));
    return item ? json(item, 201) : json({ error: "Blend not found" }, 404);
  }

  const favMatch = path.match(/^\/api\/favorites\/([^/]+)$/);
  if (favMatch && method === "DELETE") {
    offlineStore.removeFavorite(favMatch[1]);
    return json({ success: true });
  }

  // Discover & profile
  if (path === "/api/discover" && method === "GET") {
    return json(offlineStore.getDiscover());
  }
  if (path === "/api/profile" && method === "GET") {
    return json(offlineStore.getProfile());
  }
  if (path === "/api/profile" && (method === "PUT" || method === "PATCH")) {
    const result = offlineStore.updateProfile(body);
    if ("error" in result) return json({ error: result.error }, result.status);
    return json(result);
  }

  if (path === "/api/brew-logs" && method === "GET") {
    return json(offlineStore.listBrewLogs(parsed.searchParams));
  }
  if (path === "/api/brew-logs" && method === "POST") {
    const log = offlineStore.createBrewLog(body);
    return log ? json(log, 201) : json({ error: "Invalid brew log" }, 400);
  }

  const likeMatch = path.match(/^\/api\/discover\/([^/]+)\/like$/);
  if (likeMatch) {
    const recipeId = likeMatch[1];
    if (method === "POST") {
      const result = offlineStore.toggleRecipeLike(recipeId, true);
      return result ? json(result) : json({ error: "Recipe not found" }, 404);
    }
    if (method === "DELETE") {
      const result = offlineStore.toggleRecipeLike(recipeId, false);
      return result ? json(result) : json({ error: "Recipe not found" }, 404);
    }
  }

  return json({ error: "Offline demo: route not mocked" }, 404);
}

export function isOfflineDemo() {
  return process.env.NEXT_PUBLIC_OFFLINE_DEMO === "true";
}

export function installOfflineFetch() {
  if (!isOfflineDemo() || typeof window === "undefined") return;
  if ((window as unknown as { __offlineFetch?: boolean }).__offlineFetch) return;

  const original = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (url.includes("/api/")) {
      return handleOfflineRequest(input, init);
    }
    return original(input, init);
  };
  (window as unknown as { __offlineFetch?: boolean }).__offlineFetch = true;
}
