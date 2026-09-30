# Changelog

All notable changes to this project are recorded here, newest first. This file
is maintained by Claude alongside every commit — including small/minor
changes — so the history of *why* something changed is never lost, even
across sessions that don't share memory with each other.

## 2026-09-30 — Full admin catalogue CRUD, real dashboard stats, admin guide

Closed the gap where the admin UI could only *view* the catalogue, not
change it — there was no way to actually add or retire a product through
the site. Also replaced the dashboard's hardcoded sample data with real
queries, and added `ADMIN_GUIDE.md` (login, add/remove products, admin vs.
customer accounts).

**Backend**

- `catalog/admin/AdminCatalogueController.java` — rewritten with full CRUD:
  - **Products**: `GET/POST /api/admin/catalogue/products`,
    `PUT/DELETE .../products/{id}` — this tier didn't exist as an API at
    all before (only oils, packagings and variants could be written).
  - **Packagings**: added `PUT`/`DELETE` (create-only before).
  - **Variants**: added `GET` (admin listing, incl. retired), `PUT` (full
    edit — price/mrp/stock/threshold/batch/active), `DELETE` (retire).
    The existing `PATCH .../stock` stays as the lightweight stock-only path.
  - **Oils**: added `GET` (admin listing, incl. retired, with a live
    product count per oil).
  - Every endpoint now returns a flat DTO
    (`catalog/dto/AdminCatalogueDtos.java`, mapped by the new
    `catalog/service/AdminCatalogueMapper.java`) instead of a raw JPA
    entity. `application.yml` has `open-in-view: false` on purpose ("each
    request explicitly loads what it needs") — returning an entity with an
    untouched lazy relation (e.g. a freshly `findById`'d `Product`'s
    `oilCategory.features` list) would throw `LazyInitializationException`
    the moment Jackson tried to serialize it after the transaction closed.
    Mapping to a DTO inside the transactional method sidesteps that
    entirely, and gives the frontend flatter, friendlier JSON as a bonus.
  - All deletes are soft (`active = false`) — nothing is ever hard-deleted,
    so past orders referencing a retired product/variant/packaging/oil
    stay fully resolvable. Reactivating is just editing the row back to
    Active.
- New `dashboard` package — `AdminDashboardController`
  (`GET /api/admin/dashboard/stats`), `AdminDashboardService`,
  `DashboardDtos.java`: real revenue (this month vs. last month, % change),
  order counts, low-stock count, 6 most recent orders, and a 12-week sales
  series bucketed from actual order data. Revenue counts orders in
  `PAID/PACKED/DISPATCHED/DELIVERED` only (excludes unpaid, cancelled,
  failed and refunded orders).
- Repository additions to support the above: `OilCategoryRepo`,
  `PackagingRepo`, `ProductRepo`, `ProductVariantRepo` all gained
  admin-listing queries (including inactive rows, with the right
  `@EntityGraph` so nothing lazy-loads outside a transaction);
  `ProductVariantRepo` gained `countByActiveTrue`/`countLowStock`;
  `OrderRepo` gained the aggregate queries the dashboard needs.
- Verified with a syntax-only `javac` pass across the entire backend
  source tree (Maven Central isn't reachable in this sandbox — see the
  previous changelog entry) — zero parser-level errors.

**Frontend**

- `app/admin/(protected)/oils/page.tsx`,
  `app/admin/(protected)/packaging/page.tsx` — rewritten from read-only
  tables to full add/edit/retire UIs.
- `app/admin/(protected)/products/page.tsx` — rewritten to manage both
  tiers on one page: **Products** (the recipe) and **Pack sizes /
  variants** (the actual purchasable rows, each with its own SKU, price,
  MRP and stock). This is the page that answers "how do I add or remove a
  product."
- `app/admin/(protected)/dashboard/page.tsx` — now fetches
  `adminDashboardStats()` instead of rendering hardcoded orders/revenue/bars.
- `app/admin/(protected)/AdminForms.tsx` (new) — small shared `Field` and
  `StatusPill` components used by all four CRUD pages above.
- `lib/types.ts` — added `AdminOil`, `AdminPackaging`, `AdminProduct`,
  `AdminVariant`, `DashboardStats` and related types, mirroring the
  backend's `AdminCatalogueDtos`/`DashboardDtos` one for one.
- `lib/adminApi.ts` — added the full set of catalogue CRUD calls
  (`adminListOils`/`adminCreateOil`/`adminUpdateOil`/`adminRetireOil` and
  the equivalent for packagings, products and variants) plus
  `adminDashboardStats()`.
- Checked with `tsc --noEmit` against a scoped tsconfig. `npm install`
  isn't reachable in this sandbox either (same registry block as Maven),
  so full type-checking against real `@types/react`/`next` wasn't
  possible here — what *is* confirmed is zero syntax-level errors. Worth
  running `npm run typecheck` locally as a final check before merging.

**New file**

- `ADMIN_GUIDE.md` — how to log in at `/admin/login` (including the seeded
  `admin` / `admin123` `SUPER_ADMIN` account and why to replace it), how
  the Oil → Product → Variant hierarchy works and the concrete steps to
  add a new product/pack-size or retire one, and a side-by-side of what
  distinguishes an admin account from a customer account (separate login
  pages, separate JWT roles, separate DB tables, why `ADMIN` vs.
  `SUPER_ADMIN` exists).

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
