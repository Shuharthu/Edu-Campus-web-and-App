# ADR 0001: Monorepo Structure and OpenAPI Client Generation

- **Status:** Accepted
- **Date:** 2026-11-12

## Context
Smart EDU ships two clients (**Smart EDU Console** in Next.js/TypeScript and **Smart EDU App** in Flutter/Dart) backed by one NestJS API. Request/response models, enums, and pagination envelopes must never drift between Web, Mobile, and API.

## Decision
1. Use **pnpm workspaces + Turborepo** for TypeScript packages (`apps/api`, `apps/web`, `packages/ui-tokens`, `packages/api-client`, `packages/types`, `packages/config`) and **Melos** for Dart/Flutter packages (`apps/mobile`, `packages/api-client-dart`).
2. `apps/api` generates `apps/api/openapi.json` directly from NestJS Swagger decorators and DTOs.
3. A deterministic workspace generator (`scripts/generate-clients.mjs`) transforms `apps/api/openapi.json` into both `packages/api-client` (TypeScript) and `packages/api-client-dart` (Dart 3).
4. `pnpm openapi:check` runs in CI and fails the build if either generated client is out of date with `openapi.json`.

## Consequences
- Zero manual duplication of API contracts across TypeScript and Dart.
- Every endpoint change in `apps/api` explicitly surfaces as a tracked contract diff across both clients.
