# Smart EDU — Enterprise Multi-Campus University Management System

Smart EDU is an enterprise-grade university operating system consisting of **Smart EDU Web Console** (`apps/web` — Next.js 15), **Smart EDU Mobile App** (`apps/mobile` — Flutter 3), and **Smart EDU Core API** (`apps/api` — NestJS 11).

The entire system is backed **strictly and exclusively by remote Supabase PostgreSQL** (`https://vclequhmjpzxhopxuebs.supabase.co`).

---

## 1. System Architecture & Tech Stack

```
                              ┌────────────────────────────────────────┐
                              │     Smart EDU Flutter Mobile App       │
                              │     (iOS / Android / Desktop)          │
                              └──────────────────┬─────────────────────┘
                                                 │ HTTPS / WSS
┌────────────────────────────────────────┐       │
│      Smart EDU Next.js 15 Console      │       │
│      (Web Admin & Student Portal)      ├───────┼─────────────────────┐
└──────────────────┬─────────────────────┘       │                     │
                   │ HTTPS / WSS                 ▼                     │
                   └──────────────────► ┌───────────────────────────┐  │
                                        │   Smart EDU NestJS API    │  │
                                        │   (Scoped RBAC, Modular)  │  │
                                        └─────────────┬─────────────┘  │
                                                      │ Prisma ORM     │
                                                      ▼                │
                                        ┌───────────────────────────┐  │
                                        │    Supabase PostgreSQL    │◄─┘ RLS Direct
                                        │    (Remote Cloud DB)      │
                                        └───────────────────────────┘
```

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Backend API** | NestJS 11, Prisma ORM, TypeScript | Scoped RBAC (`module+action+scope`), JWT + refresh rotation, TOTP MFA, Helmet headers, Rate Limiting, OpenAPI codegen |
| **Web Console** | Next.js 15 (App Router), Tailwind CSS | 31 static routes, Geist Sans/Mono, Phosphor Icons, Dark/Light mode, Role Switcher, Sub-admin preview |
| **Mobile App** | Flutter 3, Riverpod, Drift | 25 feature screens, 0 design-token violations, offline cache, rotating QR Digital ID, biometric check-in |
| **Database** | Supabase PostgreSQL | Multi-campus schema, Row-Level Security (RLS), ACID transactions, audit event triggers |
| **Tokens & Design**| `packages/ui-tokens` | Single source of truth generating Tailwind presets and `app_tokens.dart` |

---

## 2. Complete Phase Delivery Summary

### Phase 1: Architecture & Design
- Core Data Model & ERD with multi-campus tenancy, UUID keys, and soft deletes.
- Design tokens pipeline (`tokens.json` -> Tailwind preset & Flutter tokens).
- Monorepo structure with pnpm workspaces and Melos.

### Phase 2: Foundation, Auth & Scoped RBAC
- Argon2id password hashing, TOTP MFA, and JWT session rotation.
- Scoped RBAC (`institution`, `campus`, `faculty`, `department`, `program`, `section`, `self`).
- Immutable `AuditLog` for administrative traceability.
- E2E Integration Suite: `apps/api/test/foundation.e2e-spec.ts`.

### Phase 3: Academic Core & Timetable Clash Engine
- 4-way collision-free timetable scheduler (faculty overlap, room clash, student group clash, room capacity).
- Student admissions pipeline, batch promotion, and academic catalog.
- Web Console: Timetable Builder (`/console/academics/timetable`), Academic Setup, Student Roster.
- Mobile App: Timetable day/week view with offline Drift caching.
- E2E Integration Suite: `apps/api/test/academic.e2e-spec.ts`.

### Phase 4: Attendance, Coursework & Exam Seating
- Rotating QR code attendance check-in with GPS geofence validation and defaulter thresholds (<75%).
- Coursework grading, multi-tier grade moderation board, and GPA/CGPA recalculation engine.
- Examination seating matrix with cryptographic admit card tokens.
- Web Console: Attendance Defaulters (`/console/attendance`), Live Session Projector (`/console/attendance/session`), Grade Moderation (`/console/grades`), Exam Scheduler (`/console/exams`).
- Mobile App: QR Check-in (`attendance_check_in_screen.dart`), Digital Admit Card (`admit_card_screen.dart`), What-If CGPA Calculator (`results_screen.dart`).
- E2E Integration Suite: `apps/api/test/attendance-grades.e2e-spec.ts`.

### Phase 5: Finance, Invoicing & Campus Services
- 3-tier installment invoicing, payment reconciliation, aging reports, and scholarship allocation.
- Digital Student ID with rotating 30s TOTP and security turnstile verification scanner.
- University service desk (transcripts, certificates, recommendation letters) with registrar digital seal.
- Web Console: Finance Ledger (`/console/finance`), Scholarships (`/console/finance/scholarships`), Service Requests (`/console/services`).
- Mobile App: Tuition Payment (`tuition_payment_screen.dart`), Digital ID (`digital_id_screen.dart`), Service Tracking (`services_screen.dart`).
- E2E Integration Suite: `apps/api/test/finance-services.e2e-spec.ts`.

### Phase 6: Communication & Realtime
- Multi-channel announcement dispatch (Push, Email, SMS, In-App) with audience segmentation and read receipts.
- Course discussion channels and realtime chat threads.
- Notification preferences and quiet hours management.
- Web Console: Communication Center (`/console/communication`), Course Threads (`/console/communication/threads`), Dispatch Queue Logs (`/console/communication/logs`).
- Mobile App: Notice Board (`notices_screen.dart`), Course Discussion (`chat_screen.dart`), Notification Preferences (`notification_preferences_screen.dart`).
- E2E Integration Suite: `apps/api/test/communication.e2e-spec.ts`.

### Phase 7: Library, Campus Operations & Career Hub
- Central library catalog, RFID/barcode issuance, book reservations, and overdue fine engine.
- Campus hostel room allocation, transit fleet GPS tracking, and facility maintenance dispatch.
- Career board with corporate listings, verified CGPA student resumes, and applicant review drawers.
- Web Console: Central Library (`/console/library`), Operations Desk (`/console/operations`), Career Hub (`/console/career`).
- Mobile App: Library Kiosk Pass (`library_screen.dart`), Campus Transit Tracker (`campus_operations_screen.dart`), Career Board (`career_screen.dart`).
- E2E Integration Suite: `apps/api/test/library-operations-career.e2e-spec.ts`.

### Phase 8: Analytics, Surveys & Grounded Smart Assistant
- Executive institutional analytics (retention velocity, attendance health, mean CGPA, revenue realization).
- Explainable At-Risk Student Early Warning System with multi-factor risk scores (0–100) and counseling drawer.
- Anonymous course evaluation surveys with 4 pedagogical rating dimensions (Clarity, Engagement, Fairness, Overall).
- Grounded student AI assistant ("Ask Smart EDU") answering queries strictly with official university citations (`Source: ...`).
- Web Console: Executive Analytics (`/console/analytics`), At-Risk Warning (`/console/analytics/at-risk`), Course Surveys (`/console/analytics/surveys`).
- Mobile App: Grounded Assistant (`smart_assistant_screen.dart`), Adaptive Study Planner (`study_planner_screen.dart`), Course Evaluation (`course_evaluation_screen.dart`).
- E2E Integration Suite: `apps/api/test/analytics-assistant.e2e-spec.ts`.

### Phase 9: Hardening, Compliance & Release
- FERPA 34 CFR § 99.10 and GDPR Art. 20 machine-readable student data portability export (`POST /api/v1/compliance/export`).
- Statutory right-to-erasure intake workflow with legal academic retention notices (`POST /api/v1/compliance/erasure-request`).
- OWASP Top 10 & API Security Top 10 defense matrix with verified server-side controls.
- Cryptographic, immutable audit trail viewer (`/console/compliance`).
- E2E Integration Suite: `apps/api/test/compliance-security.e2e-spec.ts`.

---

## 3. Quickstart & Local Setup

### Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x
- Remote Supabase PostgreSQL project

### Environment Configuration
The repository includes pre-configured environment templates. Create `.env` in the root workspace:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` points to your remote Supabase instance:
```env
DATABASE_URL="postgresql://smartedu.vclequhmjpzxhopxuebs:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require"
```

### Installation & Run Commands
```bash
# 1. Install dependencies
pnpm install

# 2. Build design tokens
pnpm tokens:build

# 3. Generate Prisma client
pnpm db:generate

# 4. Start NestJS API (Port 4000)
cd apps/api && npm run build && node dist/src/main.js

# 5. Start Next.js Console (Port 3000)
cd apps/web && npm run build && npx next start -p 3000
```

---

## 4. Default Seed Accounts

All accounts use the standard password: **`SmartEdu#2026`**  
*(In local development mode, all administrative accounts accept the bypass 2FA code: `123456`)*

| Role | Email | Scope |
| :--- | :--- | :--- |
| **Super Admin** | `zayed.chowdhury@university.edu` | Global Institution |
| **Campus Admin (Dean)** | `tariq.mahmud@university.edu` | Main Campus |
| **Registrar (Sub-admin)** | `nusrat.jahan@university.edu` | Admissions & Records |
| **Faculty & Dept Head** | `dr.rahman@university.edu` | Department of CSE |
| **Undergraduate Student** | `rafiq.hasan@student.university.edu` | B.Sc. CSE (Roll 2024-CSE-0042) |
| **Guardian / Parent** | `kamal.hasan@parent.university.edu` | Parent of Rafiq Hasan |

---

## 5. API Documentation & Postman Collection

- **Interactive Swagger Documentation:** `http://localhost:4000/api/docs`
- **Postman / Bruno Collection Export:** `docs/api-collection.json`
- **OpenAPI 3.1 Spec Export:** `apps/api/openapi.json`

---

## 6. Automated Quality & Security Verification

```bash
# Verify 0 Flutter design token violations across all 25 screens
node scripts/check-flutter-tokens.mjs

# Run all 8 E2E test suites against live remote Supabase PostgreSQL
cd apps/api && npx jest --config ./test/jest-e2e.json --runInBand --forceExit
```
