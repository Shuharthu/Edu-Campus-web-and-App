# Smart EDU — Console & App Connection Contract

This document defines the single authoritative contract linking **Smart EDU Console** (`apps/web`), **Smart EDU App** (`apps/mobile`), and **Smart EDU API** (`apps/api`). It is enforced in CI by automated OpenAPI drift checks and realtime integration tests.

## 1. Shared Core Pillars

1. **One Auth Service (`/api/v1/auth/*`):**
   - Both Web Console and Mobile App authenticate against the same JWT + refresh rotation + TOTP MFA + Google/Microsoft OIDC endpoints.
   - `SUPER_ADMIN`, `ADMIN`, `SUB_ADMIN`, and `FACULTY` require MFA verification.
   - `STUDENT` and `PARENT` accounts accessing the Web Console are routed strictly to `/portal` and denied `/console/*` routes server-side.
   - Multi-role switching via `POST /api/v1/auth/switch-role` updates the active role assignment (`activeRoleAssignmentId`) used across both Web and Mobile sessions.

2. **One Permission Model (`(module, action, scope)`):**
   - Server-side `PermissionsGuard` + `TenantScopeGuard` evaluates every request using the authenticated user's active `RolePermission` set and `UserRoleAssignment` scope (`own`, `section`, `department`, `program`, `campus`, `institution`).
   - Web and Mobile hide unauthorized navigation via `GET /api/v1/auth/me` capability claims, while the API remains the sole enforcement authority.

3. **One Versioned API (`/api/v1` + OpenAPI 3.1):**
   - `apps/api` emits `openapi.json` directly from NestJS DTOs and controllers.
   - `packages/api-client` (TypeScript) and `packages/api-client-dart` (Dart) are generated strictly from `openapi.json`.
   - `pnpm openapi:check` fails CI whenever a generated client is stale.

4. **One Event Bus (Redis Pub/Sub -> WebSocket Gateway + BullMQ Push/Email/SMS):**
   - Every domain mutation publishes a typed `DomainEventEnvelope` to Redis channel `smartedu.events`.
   - The NestJS WebSocket Gateway (`/ws`) authenticates connections via short-lived JWT and fans out events strictly to authorized `user:<id>`, `role:<slug>`, `campus:<id>`, and `section:<id>` rooms.
   - A BullMQ Notification Worker consumes the same event stream, checks `NotificationPreference` (quiet hours, per-event channel toggles), creates persistent `Notification` rows, and dispatches FCM/APNs push, SMTP email, and SMS adapter messages.

## 2. Domain Event Matrix

| Event Name | Triggering API Action | Console Screens Updated (WS) | Mobile App Screens Updated (WS + Drift Cache Invalidation) | Push / External Delivery |
|---|---|---|---|---|
| `attendance.marked` | `POST /attendance/sessions/:id/check-in` or `POST /attendance/bulk-correct` | Live Attendance Session roster, Overview Attendance Today KPI, Attendance Defaulter list | Student Home risk pill, Course Attendance detail, Digital ID term attendance bars, Faculty session live counter; invalidates Drift `attendance` cache | FCM push to student (and linked guardians if marked absent or attendance drops below 75%) |
| `grade.published` | `POST /results/publish-lock` or `PUT /grades/batch` (when published) | Result Processing status, Overview Live Activity feed, Student Profile Academics tab | Student Results screen (GPA/CGPA hero card + course grade pills), Parent linked student results, Course Detail marks | FCM push + Email summary to enrolled students and linked guardians |
| `notice.sent` | `POST /announcements/:id/publish` or scheduled BullMQ job | Communication Center delivery/read counters, Overview Live Activity feed | Home unread notices card, Inbox / Notice Board, Offline Drift notices cache sync | FCM push + SMTP Email + SMS per targeted segment (`campus`, `program`, `batch`, `section`, `role`) & preferences |
| `invoice.paid` | `POST /webhooks/stripe` (`payment_intent.succeeded`) or manual reconciliation | Fee Ledger invoice status, Overview Fees Collected KPI, Student Profile Fees tab | Pay Installment screen (`Paid` status + progress bar), Receipt list, Student Home Tuition Due card | In-app notification + Email receipt with PDF receipt link |
| `request.updated` | `PATCH /service-requests/:id/status` or `POST /approvals/:id/decide` | Service Desk queue, Overview Open Requests KPI, Approval Inbox | Services Tracker timeline, Grade Appeal / Leave Application status badge | FCM push + Email to requester (and next approver in chain) |
| `class.rescheduled` | `POST /timetable/publish` or `PATCH /timetable/slots/:id` | Timetable Builder grid, Overview Today's Classes list (`Room changed` / `Cancelled`) | Student/Faculty Home Next Class hero card, Timetable Day/Week view; invalidates Drift `timetable` cache | High-priority FCM push + Email to affected section students and assigned faculty |

## 3. WebSocket Wire Format

All WebSocket frames on `wss://<api-host>/ws?token=<jwt>` use JSON envelopes:

```json
{
  "id": "01931f82-8e1a-7c4d-b21f-9a21f43e8810",
  "event": "attendance.marked",
  "version": 1,
  "institutionId": "uuid",
  "campusId": "uuid",
  "occurredAt": "2026-11-12T09:14:22.000Z",
  "payload": {
    "sessionId": "uuid",
    "sectionId": "uuid",
    "studentId": "uuid",
    "status": "PRESENT",
    "attendancePct": 84.2
  }
}
```

Clients acknowledge receipt via `{"type":"ping"}` / `{"type":"pong"}` heartbeats every 25s and reconnect with exponential jitter (`1s -> 2s -> 4s -> 8s -> max 30s`), followed by a `GET /api/v1/sync/delta?since=<iso>` catch-up fetch so no state change is lost during offline intervals.
