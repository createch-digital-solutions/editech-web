# Createch Learning Platform — Web Application (`createch-web`)

This repo is independently installable and runnable. It does not depend on any other Createch repo at build or install time — only at runtime, over HTTP, against `NEXT_PUBLIC_API_BASE_URL` / CORS-allowed origins.

> **Context Pointer**: For full architectural rules and AI agent boundaries, see [CLAUDE.md](./CLAUDE.md). For deferred backlog items, see [TODO.md](./TODO.md).

---

## Tech Stack
- **Framework**: Next.js 16+ (App Router) + TypeScript + React 19
- **Styling**: Tailwind CSS + shadcn/ui (light/dark themeable)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Testing**: Vitest + React Testing Library (unit/smoke) & Playwright (E2E) in `tests/`
- **Analytics/Monitoring**: PostHog & Sentry SDK wrappers

---

## Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0

---

## Getting Started

### 1. Installation
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
pnpm dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## Testing & Quality Commands
```bash
# Run unit & smoke tests (Vitest)
pnpm test

# Run E2E tests (Playwright)
pnpm test:e2e

# Run linter
pnpm lint

# Run type check
pnpm typecheck

# Build for production
pnpm build
```

---

## Shared Contracts & Types Note
Any type or contract that both `createch-web` and `createch-api` need (e.g. "what a Course looks like in an API response") is currently maintained locally inside `src/types/`.

Once the API contracts stabilize, this will be published as an independent, versioned npm package (e.g. `@createch/api-contracts`) and installed as a normal external dependency — never as a local path/workspace reference.

---

## What is NOT Built Yet (MVP Scope)
The following are deferred until Phase 6+ PRD implementation:
- Real course catalog retrieval and checkout flows
- Interactive AI Tutor floating chat widget
- Learner lesson player and quiz submission engine
- Instructor course creator wizard & rich content upload
- Admin dashboard analytics & user moderation actions
