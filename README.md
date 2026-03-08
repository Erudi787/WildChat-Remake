# WildChat – Love Purrs Around Campus

Modern rebuild of the legacy WildChat campus-based real-time chat application. Built as a monorepo with web (Next.js) and mobile (Expo) clients sharing APIs and types.

## Project Structure

```
WildChat-Remake/
├── apps/
│   ├── web/          # Next.js 15 + Tailwind + shadcn/ui
│   └── mobile/       # Expo with Expo Router
├── packages/
│   ├── types/        # Shared DTOs, Zod schemas, API contracts
│   └── api-client/   # Typed fetch wrapper for web and mobile
├── package.json      # Root workspace config
└── turbo.json        # Turborepo task config
```

## Prerequisites

- Node.js 20+
- npm 9+ (or pnpm)
- PostgreSQL (for web app; use Supabase/Neon for hosted)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment (web app)**

   Copy the example env and set your values:

   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

   Edit `apps/web/.env`:

   - `DATABASE_URL` – PostgreSQL connection string
   - `AUTH_SECRET` – Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` – e.g. `http://localhost:3000`

3. **Initialize database**

   ```bash
   cd apps/web && npx prisma db push
   ```

## Development

- **Web**: `npm run dev` (from root) or `cd apps/web && npm run dev`
- **Mobile**: `cd apps/mobile && npm run start`

## Build

- **Web**: `cd apps/web && npm run build`
- **Mobile**: `cd apps/mobile && npx expo export` (or EAS Build for native)

> **Note**: Next.js 15 production build may fail with a `useContext` prerender error on 404/500 pages in some environments. Development mode works correctly. This is a known upstream issue (Next.js + React 19 + monorepo). Use `npm run dev` for local development.

## Phase 0 Status

- [x] Turborepo monorepo with apps/web and apps/mobile
- [x] Shared packages: types, api-client
- [x] Next.js with Tailwind, shadcn/ui, Prisma, Auth.js (credentials provider)
- [x] Expo app with Expo Router
- [x] Base layout and routing for web and mobile

## License

See [LICENSE](LICENSE).
