# E2E tests (Playwright)

Automated browser test for the core journey: **welcome → laboratory → blend → timer → brew log**.

## See it run (interactive UI)

```bash
npm install
npx playwright install chromium
npm run test:e2e:ui
```

This opens the **Playwright UI** where you can watch each step, time-travel, and inspect screenshots.

## Headless run

```bash
npm run test:e2e
```

Uses an existing dev server on port 3000 if one is running (`reuseExistingServer`). Otherwise starts `npm run dev` with `SKIP_AUTH=true`.

## HTML report (after a run)

```bash
npm run test:e2e:report
```

Opens `playwright-report/index.html` in your browser.

## Test file

- `e2e/welcome-brew-log.spec.ts` — full flow using a 5-second timer (clock fast-forward)

## Proxy migration (Next.js 16)

The deprecated `src/middleware.ts` was migrated to **`src/proxy.ts`**:

```ts
export { auth as proxy } from "@/lib/auth";
```

After migration, the dev server should **no longer** print:

`⚠ The "middleware" file convention is deprecated`

Restart `npm run dev` to confirm the warning is gone.
