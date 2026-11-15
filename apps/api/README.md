# Smart EDU API (`apps/api`)

NestJS + Prisma + PostgreSQL + Redis Pub/Sub + native WebSocket (`/ws`) + OpenAPI 3.1.

## Commands
- `pnpm --filter @smart-edu/api dev` — start API in watch mode on port `4000`
- `pnpm --filter @smart-edu/api openapi:export` — generate `openapi.json`
- `pnpm --filter @smart-edu/api test` — unit tests
- `pnpm --filter @smart-edu/api test:e2e` — integration tests (Auth, MFA, RBAC, Preview, Audit)
