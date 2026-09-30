# Changelog

All notable changes to this project are recorded here, newest first. This file
is maintained by Claude alongside every commit — including small/minor
changes — so the history of *why* something changed is never lost, even
across sessions that don't share memory with each other.

## 2026-09-30 — Fix: SecurityConfig.java Javadoc comment self-terminating early

- **Bug:** `backend/src/main/java/in/madhuroil/config/SecurityConfig.java`
  had a Javadoc comment (around the `corsConfigurationSource` bean) whose
  text included the literal sequence `192.168.*/10.*/172.16-31.*` — but `*/`
  is what *ends* a `/** */` comment, wherever it appears. So the comment
  actually closed right after `192.168.`, and everything after that (several
  lines of comment text, down to the real `*/`) got parsed as Java code
  instead of a comment. That produced a cascade of ~29 unrelated-looking
  compiler errors (`illegal start of type`, `';' expected`, `illegal
  character: '—'`, `unclosed character literal`, …) all pointing at
  lines that were actually just prose.
- **Fix:** reworded the comment to avoid writing pattern-style
  `192.168.*/10.*` — now spelled out as `192.168.x.x, 10.x.x.x and
  172.16-31.x.x` — so no `*/` sequence occurs before the comment's real end.
  No behavior change; the CORS origin-matching logic itself was untouched.
- Verified with a syntax-only `javac` pass (Spring not on the classpath in
  this environment, so full `mvn compile` isn't runnable here) — confirmed
  zero parser-level errors remain; only expected "cannot find symbol" for
  Spring imports, which resolve fine once run with the real dependencies.

## 2026-09-30 — Initial push to GitHub

- Connected the project to `github.com/Charvit123/madhur-mini-oil-mil` and
  pushed the current state of both the Next.js frontend (`web/`) and the
  Spring Boot backend (`backend/`) as the initial commit.
- Added `.gitignore` (node_modules, .next, target/, .env files, IDE/OS junk).
- Added this `CHANGELOG.md`.

### State of the project at this point

**Frontend (`web/`)** — Next.js 16.3.6 (App Router) + React 19 + TypeScript +
Tailwind CSS + Framer Motion + Zustand.
- Full storefront: home, shop (with filters), oil category pages, product
  detail pages, cart drawer, checkout, account (OTP login + order history),
  about, contact.
- Full admin UI: dashboard, oils, packaging, products/variants, inventory,
  reviews, orders (with refund action), admins (role-based, SUPER_ADMIN-only
  management), all gated behind `/admin/(protected)` route group backed by
  `RequireAdmin`.
- Auth: separate customer (OTP-based) and admin (username/password) JWT
  sessions via Zustand + persist, under different storage keys.
- Fonts self-hosted via `@fontsource/fraunces` + `@fontsource/hanken-grotesk`
  (migrated off `next/font/google` to work around a Turbopack bug fetching
  fonts live from Google at dev/build time).

**Backend (`backend/`)** — Spring Boot 3.5.11, Java 21, Spring Data JPA,
Spring Security 6.x, Flyway, PostgreSQL.
- Catalogue: OilCategory → Product → ProductVariant ← Packaging, fully
  admin-editable, no hardcoded oil/pack data on the frontend.
- Orders + payments: Razorpay integration via direct REST calls (no SDK
  dependency), real refunds (`POST /v1/payments/{id}/refund`), COD support.
- No coupon system (removed by design) — manual per-order discount only.
- Role-based multi-admin (`ADMIN` / `SUPER_ADMIN`) backed by a DB-stored
  `admin_user` table, guarded against removing the last active SUPER_ADMIN.
- OTP-based customer authentication (`DevSmsSender` for local/dev; real SMS
  gateway integration deferred until the user has provider credentials).
- Self-issued JWT auth (HS256, jjwt) — no external identity provider.

### Known follow-ups (not yet done)
- Real SMS gateway (e.g. Msg91) wiring for OTP in production — deferred
  until the user has DLT registration + API credentials.
- Razorpay webhook configuration — deferred until a real domain is live.
- `eslint-config-next` had been mismatched against the installed `next`
  version; corrected as part of the font-loading fix prior to this push.
