# ADR 0002: Unified Authentication, Scoped RBAC, and Multi-Campus Tenancy

- **Status:** Accepted
- **Date:** 2026-11-12

## Context
Smart EDU serves six role tiers (`SUPER_ADMIN`, `ADMIN`, `SUB_ADMIN`, `FACULTY`, `STUDENT`, `PARENT`) across multiple campuses. Users can hold multiple roles simultaneously, delegate acting roles for limited durations, and preview lower-privilege roles.

## Decision
1. **Single Auth Service:** Email/password (Argon2id) and Google/Microsoft OIDC issue short-lived JWT access tokens (`15m`) paired with SHA-256 hashed rotating refresh tokens (`RefreshToken`) bound to `deviceId` and `familyId`. Token reuse triggers immediate revocation of the token family.
2. **Staff MFA Enforcement:** All staff tiers (`SUPER_ADMIN`, `ADMIN`, `SUB_ADMIN`, `FACULTY`) require TOTP MFA setup and verification (encrypted AES-256-GCM secrets at rest + single-use recovery codes).
3. **Scoped RBAC:** Every `Permission` is defined as `(module, action, scope)` where `scope` ∈ `{own, section, department, program, campus, institution}`. `UserRoleAssignment` binds a user to a `Role`, an optional `campusId`/`departmentId`/`programId` scope, and optional `validFrom`/`validTo` acting dates.
4. **Role Switching & View-as-Role:** Multi-role users switch `activeRoleAssignmentId` via `POST /auth/switch-role`. Admins can enter read-only `preview` mode (`isPreview: true`), where `ReadOnlyPreviewGuard` rejects every mutating HTTP method on the server.
5. **Immutable Audit Trail:** `AuditInterceptor` writes before/after JSON snapshots, actor ID, active role, scope used, IP, and user agent to `AuditLog`.

## Consequences
- All privilege checks are enforced exclusively server-side with zero reliance on client UI state.
- Cross-campus isolation and acting-role expiration work automatically on every API call.
