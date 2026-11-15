# ADR 0003: Realtime WebSocket Bus and Offline Cache Strategy

- **Status:** Accepted
- **Date:** 2026-11-12

## Context
Changes on the Web Console (such as attendance marked, timetable changes, notices, and grades) must reflect in the Mobile App within seconds, while students must still view their timetable, notices, and Digital ID offline.

## Decision
1. **Native WebSocket Gateway (`ws`):** `apps/api` exposes `/ws` using native RFC 6455 WebSockets (`@nestjs/platform-ws`) rather than Socket.IO so Flutter's `web_socket_channel` and Next.js browser `WebSocket` consume identical JSON frames.
2. **Redis Pub/Sub + BullMQ:** API instances publish domain events to Redis Pub/Sub channel `smartedu.events` for horizontal WebSocket fan-out and enqueue durable push/email/SMS jobs onto BullMQ.
3. **Drift SQLite Cache:** `apps/mobile` caches timetable slots, notices, and the signed Digital ID payload locally in Drift SQLite with explicit sync timestamps and delta catch-up on reconnect.

## Consequences
- Sub-second synchronization between Console and App without protocol mismatch.
- Resilient mobile UX when campus Wi-Fi or cellular connectivity drops.
