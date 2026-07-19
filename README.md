# Infusion Studio

Craft artisan infusions: ingredient pantry, drag-and-drop blends, brew timer, and brew history.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS 4**
- **Prisma** + **SQLite** (local dev) · **NextAuth.js v5**
- **Capacitor** — offline APK (`android/`)
- **Playwright** — e2e tests

## Quick start

```bash
npm install
cp .env.example .env    # set DATABASE_URL, AUTH_SECRET (or SKIP_AUTH=true for local)
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Trial login:** `trial@trial.com` / `trial123`

## Project layout

```
src/
├── app/
│   ├── (auth)/              Login & register
│   ├── (dashboard)/         App pages (ingredients, blends, timer, …)
│   ├── api/                 REST routes
│   ├── layout.tsx, page.tsx, globals.css
│   └── proxy.ts             Auth proxy (Next.js 16)
├── components/
│   ├── layout/              Shell, sidebar, mobile nav
│   ├── landing/             Welcome page
│   ├── ui/                  Primitives & effects
│   └── …                    Feature components (blends, timer, etc.)
├── lib/                     Auth, prisma, offline-demo, validations
├── stores/                  Zustand
└── types/
android/                     Capacitor Android project
docs/                        Routing, E2E, QA guides
e2e/                         Playwright specs
prisma/                      Schema & seed
scripts/                     QA smoke tests & APK build scripts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema |
| `npm run db:seed` | Seed demo data |
| `npm run qa:web` | Route + API smoke test (server on :3000) |
| `npm run qa:offline` | Static export build check (stop dev first) |
| `npm run test:e2e` | Playwright tests |
| `npm run test:api` | API-only smoke test |
| `npm run android:build:offline` | Build offline APK |

See [docs/](docs/) for routing (web vs APK), E2E, and Samsung QA.

## License

MIT
