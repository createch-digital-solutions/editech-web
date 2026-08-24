# Createch Web — Deferred Work & Backlog (TODOs)

This file tracks all deferred work and mirrors inline `// TODO:` comments across the codebase. Grouped by priority based on the MVP Definition.

---

## MUST (Phase 5 MVP Core)
- [ ] `middleware.ts`: Implement role-based route guard checks in Clerk middleware (e.g. check user role metadata for `/admin` vs `/instructor` vs `/learner`).
- [ ] `lib/api-client.ts`: Attach Clerk authentication bearer token (`Authorization: Bearer <token>`) to outgoing authenticated requests.
- [ ] `src/app/(public)/page.tsx`: Connect public landing page to backend course catalog API (`GET /courses`).
- [ ] `src/app/(learner)/dashboard/page.tsx`: Render learner enrollments from backend API (`GET /learner/enrollments`).
- [ ] `src/app/(instructor)/portal/page.tsx`: Render instructor course management table from backend API (`GET /instructor/courses`).
- [ ] `src/app/(admin)/admin/page.tsx`: Render admin statistics and user management table (`GET /admin/stats`).

---

## SHOULD (MVP Enhancements)
- [ ] `src/lib/posthog.ts`: Wire client-side event tracking for course clicks, enrollment attempts, and lesson completions.
- [ ] `src/lib/sentry.ts`: Configure custom error boundary capturing and user feedback widget.
- [ ] `src/components/ui/`: Add missing shadcn/ui primitives (dialog, dropdown, avatar, table, toast notifications).
- [ ] `src/types/`: Publish and consume `@createch/api-contracts` once OpenAPI specifications stabilize across teams.

---

## PHASE 2 (Post-MVP / Future Iterations)
- [ ] Offline caching and PWA service workers for mobile/low-bandwidth Nigerian networks.
- [ ] Real-time WebSocket notifications for peer-to-peer community chat.
- [ ] Rich multi-tier localization (English, Hausa, Yoruba, Igbo).
