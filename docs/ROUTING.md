# Routing: Web vs Offline APK

Infusion Studio uses **one codebase** with two URL shapes:

| Context | Detail URLs | Why |
|---------|-------------|-----|
| **Web** (Next.js server) | `/ingredients/[id]`, `/blends/[id]` | Dynamic routes + API |
| **Offline APK** (static export) | `/ingredients/item?id=…`, `/blends/item?id=…` | Query-param pages for `generateStaticParams` |

Always link with helpers in `src/lib/entity-path.ts`:

- `ingredientPath(id)` / `ingredientEditPath(id)`
- `blendPath(id)` / `blendEditPath(id)`

Never hard-code `/ingredients/${id}` in shared UI — it breaks the APK.

## Theme

- **Web**: `html.theme-alchemy` is set in `src/app/layout.tsx` when `NEXT_PUBLIC_OFFLINE_DEMO !== "true"`.
- **APK**: Optional alchemy theme via Settings → Enable alchemy theme (`AlchemyThemeBridge`).

## QA

```bash
npm run qa:web      # Requires dev server on :3000
npm run qa:offline  # Stop dev server first (locks src/app/api)
npm run qa:all      # Both
```
