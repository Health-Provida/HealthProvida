# HealthProvida Monorepo

Nigeria's trusted healthcare platform — a monorepo containing the **Patient Portal** and **Laboratory Partner Portal**.

## Architecture

```
HealthProvida/
├── apps/
│   ├── patient-portal/   — Public-facing patient app (React 18, Vite, Tailwind v3, JSX)
│   └── lab-portal/       — Diagnostic lab partner portal (React 19, Vite, Tailwind v4, TypeScript)
├── supabase/
│   └── migrations/       — Database migration SQL files
├── package.json          — Root workspace config
├── pnpm-workspace.yaml   — pnpm workspace definition
├── turbo.json            — Turborepo task configuration
└── vercel.json           — Deployment routing
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9

## Getting Started

```bash
# Install all dependencies
pnpm install

# Copy environment variables
cp .env.example apps/patient-portal/.env
# Edit apps/patient-portal/.env with your Supabase credentials

# Run both apps in development
pnpm dev

# Run individual apps
pnpm dev:patient   # Patient portal at http://localhost:8080
pnpm dev:lab       # Lab portal at http://localhost:5174/lab/
```

## Available Commands

| Command              | Description                              |
|----------------------|------------------------------------------|
| `pnpm dev`           | Start all apps in development mode       |
| `pnpm dev:patient`   | Start patient portal only                |
| `pnpm dev:lab`       | Start lab portal only                    |
| `pnpm build`         | Build all apps for production            |
| `pnpm build:patient` | Build patient portal only                |
| `pnpm build:lab`     | Build lab portal only                    |
| `pnpm lint`          | Lint all apps                            |
| `pnpm lint:patient`  | Lint patient portal only                 |
| `pnpm lint:lab`      | Lint lab portal only                     |
| `pnpm typecheck`     | Run TypeScript checks across workspace   |

## Environment Variables

### Patient Portal (`apps/patient-portal/.env`)

| Variable                       | Description                    |
|--------------------------------|--------------------------------|
| `VITE_SUPABASE_URL`           | Supabase project URL           |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_GOOGLE_MAPS_API_KEY`    | Google Maps API key (optional) |

### Lab Portal (`apps/lab-portal/.env`)

| Variable            | Description                         |
|---------------------|-------------------------------------|
| `VITE_API_BASE_URL` | Backend API base URL (if connected) |
| `VITE_SITE_URL`     | Public site URL for OG tags         |

## Deployment

Both apps are configured for shared-domain deployment:

- **Patient Portal**: `https://healthprovida.com/`
- **Lab Portal**: `https://healthprovida.com/lab/`

The patient portal builds to `apps/patient-portal/dist/` and the lab portal builds to `apps/lab-portal/dist/` (with `base: "/lab/"` configured).

Vercel routing is configured in `vercel.json` to serve each app under its path prefix.

## Supabase

Database migration files are preserved in `supabase/migrations/`. These are reference copies of migrations that have already been applied to the production database.

> **Warning**: Do not blindly re-run these migrations against production. They document the schema evolution and are kept for reference.

## Technology Stack

| Feature       | Patient Portal        | Lab Portal            |
|---------------|-----------------------|-----------------------|
| React         | 18.x                  | 19.x                  |
| Router        | react-router-dom v6   | react-router-dom v7   |
| Tailwind CSS  | v3 (PostCSS)          | v4 (Vite plugin)      |
| Language      | JavaScript (JSX)      | TypeScript (TSX)      |
| UI Components | Custom + Radix        | shadcn/ui + Radix     |
| Data Layer    | Supabase (live DB)    | In-memory seed data   |
| Build Tool    | Vite 8                | Vite 8                |

