# Createch Learning Platform — Web Application (`createch-web` / `editech-web`)

## Mission & Boundary Rules
- **Role**: Next.js App Router client application for the Createch AI-powered learning marketplace.
- **Hard Boundary**: Communicates **ONLY** over HTTP REST with `createch-api` (documented via Swagger at `/docs`).
- **No Monorepo / Shared Code**: Zero cross-directory imports, no shared npm workspaces, no local package links. All API response types are locally mirrored in `src/types/`.
- **Scope Lock**: ONLY implement what is specified as MUST/SHOULD in the MVP Definition. Any other ideas/features go to `TODO.md`, not into code.

## Approved Tech Stack
- **Framework**: Next.js (App Router) + TypeScript + React 19
- **Package Manager**: `pnpm`
- **Styling**: Tailwind CSS + shadcn/ui (light/dark mode enabled via `next-themes`)
- **Authentication**: Clerk (`@clerk/nextjs` + `middleware.ts`)
- **Analytics & Monitoring**: PostHog (`posthog-js`) & Sentry (`@sentry/nextjs`) — SDK wrappers initialized, event tracking deferred
- **Testing**: Vitest + React Testing Library (unit/smoke in `tests/unit/`), Playwright (e2e in `tests/e2e/`) — *All tests live outside `src/`*

## Key Commands
```bash
pnpm dev           # Start Next.js development server (default port 3000)
pnpm build         # Build production Next.js bundle
pnpm start         # Run production server
pnpm lint          # Run ESLint checks
pnpm test          # Run Vitest unit & smoke tests
pnpm test:e2e      # Run Playwright E2E tests
```

## Directory Conventions
```
createch-web/
├── src/
│   ├── app/
│   │   ├── (public)/       # Marketplace, landing, course browsing
│   │   ├── (learner)/      # Learner dashboard and course progress
│   │   ├── (instructor)/   # Instructor studio and course management
│   │   └── (admin)/        # Admin portal
│   ├── components/         # UI components & design system (local shadcn/ui)
│   ├── lib/                # api-client.ts, analytics & utility wrappers
│   ├── types/              # Locally maintained contract types (mirrored from API)
│   └── middleware.ts       # Clerk route protection & auth gate
├── tests/                  # All unit, integration, and E2E tests (outside src/)
├── .github/workflows/      # Independent GitHub Actions CI pipeline
├── CLAUDE.md               # Agent brief & guidance
├── TODO.md                 # Scanned deferred backlog (MUST/SHOULD/PHASE 2)
└── README.md
```
