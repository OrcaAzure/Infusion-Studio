# Infusion Studio

A production-quality web application for crafting artisan infusions. Manage your ingredient inventory, design custom blends with drag-and-drop, save recipes, track favorites, and brew with a precision timer.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Prisma ORM** + **PostgreSQL**
- **NextAuth.js v5** (credentials authentication)
- **Zustand** (client state)
- **React Hook Form** + **Zod** (forms & validation)
- **@dnd-kit** (drag-and-drop blend creator)
- **Framer Motion** (animations)

## Features

- User authentication (register / login)
- Ingredient inventory with search, filter, and sort
- Detailed ingredient pages with flavor profiles
- Drag-and-drop blend creator
- Recipe saving with brewing notes
- Favorite blends
- Brew timer with presets and notifications
- Dashboard analytics (inventory value, low-stock alerts, category breakdown)
- Responsive UI with dark mode

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and AUTH_SECRET

# Push schema to database
npm run db:push

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Trial Account

After seeding, sign in at `/login` with:

- **Email:** `trial@trial.com`
- **Password:** `trial123`

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & register pages
│   ├── (dashboard)/     # Protected app pages
│   └── api/             # REST API routes
├── components/
│   ├── ui/              # Reusable UI primitives
│   ├── layout/          # Sidebar, theme toggle
│   ├── auth/            # Auth forms
│   ├── ingredients/     # Inventory components
│   ├── blends/          # Blend creator (DnD)
│   ├── timer/           # Brew timer
│   └── dashboard/       # Analytics widgets
├── lib/                 # Auth, Prisma, validations
├── stores/              # Zustand stores
└── types/               # TypeScript definitions
prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Demo data seeder
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync schema to DB |
| `npm run db:seed` | Seed demo data |
| `npm run db:migrate` | Create migration |

## License

MIT
