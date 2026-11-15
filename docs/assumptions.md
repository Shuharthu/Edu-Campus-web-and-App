# Smart EDU — Architecture & Product Assumptions

This document records deliberate engineering and product decisions where requirements allowed multiple valid interpretations (Section 13).

## 1. Institution Placeholders & Defaults
- Until institution-specific values are supplied, configuration defaults and `.env.example` use explicit `{{placeholder}}` keys (`{{university_name}}`, `{{university_short_name}}`, `{{institution_domain}}`, `{{support_email}}`, `{{academic_calendar}}`).
- Local development seed scripts populate realistic academic records under a demo tenant slug while keeping branding keys configurable through `Institution` settings.
- Currency formatting defaults to `USD` (`$`) and timezone defaults to `UTC` (overridable per `Campus`), matching the provided UI reference screens.
- Secondary localization language defaults to **Arabic (`ar`)** alongside English (`en`) so both internationalization (`intl`/ARB) and full Right-to-Left (RTL) layout mirroring can be verified end to end.

## 2. Authentication, MFA & Device Sessions
- **Password hashing:** Argon2id (`@node-rs/argon2` or pure/WASM fallback where native addons fail on Windows CI, defaulting to Argon2id with bcrypt fallback check if needed — strictly Argon2id for all newly hashed credentials).
- **Staff MFA enforcement:** All staff tiers (`SUPER_ADMIN`, `ADMIN`, `SUB_ADMIN`, `FACULTY`) require TOTP MFA setup before accessing privileged endpoints. In local development (`NODE_ENV=development` / test seeds), seeded demo staff accounts have pre-configured deterministic TOTP secrets (documented in `README.md` / seed output) and a standard verification flow rather than bypassing MFA.
- **Refresh token rotation:** Refresh tokens are opaque 256-bit random values, SHA-256 hashed in PostgreSQL (`RefreshToken`) and tied to a `familyId` + `deviceId`. Presenting a previously rotated token revokes the entire token family immediately.
- **Role switching:** Multi-role users authenticate once and send `X-Active-Role-Assignment-Id` (or call `POST /auth/switch-role` to refresh access JWT claims with the selected `activeRoleAssignmentId`), ensuring server-side guards validate both role ownership and acting-delegation `validFrom` / `validTo` windows.
- **View-as-role preview:** Admins can start a read-only preview session for any role/scope within their campus authority. The API sets `isPreview: true` in the short-lived preview context and rejects all `POST`/`PUT`/`PATCH`/`DELETE` mutations while previewing.

## 3. Monorepo, Clients & Toolchain
- **WebSocket protocol:** The API uses native RFC 6455 WebSockets (`@nestjs/platform-ws` / `ws`) backed by Redis Pub/Sub instead of Socket.IO so Flutter's `web_socket_channel` and browser `WebSocket` share one lean JSON envelope without protocol translation.
- **OpenAPI client generation:** NestJS (`@nestjs/swagger`) generates `apps/api/openapi.json`. A workspace script generates typed fetch/React Query clients in `packages/api-client` and typed Dio/Dart models in `packages/api-client-dart`. CI runs `pnpm openapi:check` to fail if committed clients drift from `openapi.json`.
- **Supabase PostgreSQL & Redis local fallback:** Smart EDU uses **Supabase PostgreSQL** exclusively as its database (`DATABASE_URL` Supavisor transaction pooler + `DIRECT_URL` direct/session connection for Prisma schema pushes/migrations, with Row Level Security enabled on exposed `public` tables). `docker-compose.yml` provides local Redis 7, MinIO (S3), and Mailpit (SMTP). If Docker Desktop is unavailable on a developer workstation, `apps/api` exposes an explicit development in-memory Pub/Sub/queue adapter only when `ENABLE_LOCAL_NO_REDIS_DEV=true` (never allowed in `staging` or `production`).

## 4. Design System & Copy Enforcement
- **Typography:** `Geist` and `Geist Mono` only, maximum font weight `600` (semibold), zero italics.
- **Copy rules:** Sentence case, no hyphens inside UI text, no exclamation marks, calm factual messages.
- **Card borders:** Full 4-sided borders (`1px solid`) or no border; never single-sided card borders.
- **Flutter enforcement:** `apps/mobile/analysis_options.yaml` + a workspace Dart static check script (`scripts/check-flutter-tokens.mjs`) forbids raw `Color(`, `TextStyle(`, and numeric edge/spacing literals inside `lib/features/**`.

## 5. Security, FERPA & GDPR Privacy
- PII exports (`DataExportRequest`) exclude internal security fields (`passwordHash`, `mfaSecretEncrypted`, refresh token hashes) and generate time-limited private S3 signed URLs.
- `AuditLog` and financial `Payment`/`Invoice` ledgers are append-only; domain deletions use `deletedAt` soft deletes.
