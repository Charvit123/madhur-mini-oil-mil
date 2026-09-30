# Changelog

All notable changes to this project are recorded here, newest first. This file
is maintained by Claude alongside every commit — including small/minor
changes — so the history of *why* something changed is never lost, even
across sessions that don't share memory with each other.

## 2026-09-30 — Fix admin panel: navbar/footer leak, Customers/Payments built out, Inventory/Reviews made editable

Follow-up to the admin CRUD build-out, after the user tested it live and
reported five separate problems. Fixed all five.

**1. Navbar/footer/announcement bar were rendering inside the admin panel**

`app/layout.tsx` wrapped *every* route — including everything under
`/admin/**` — in the storefront's `<Navbar>`/`<Footer>`, because it's the one
root layout for the whole app. New `components/SiteChrome.tsx` is a small
client component that checks the current path and only renders
Navbar/Footer/CartDrawer for non-admin routes; the admin panel builds its own
chrome entirely (`AdminSidebar`) and never needed the storefront's.

**2. "Method Not Allowed" / "Forbidden" on Products, Packaging, Oils, Dashboard**

These endpoints were correct in the code — the problem was that the user was
testing against a build from *before* PR #2 (the admin CRUD work) had been
merged into `main`. Confirmed `main` now has that commit
(`aa5aeeb`, merged as `4b7ceb2`); nothing to fix here beyond redeploying from
current `main`.

**3. Inventory — now editable, with a working CSV export**

`app/admin/(protected)/inventory/page.tsx` was a static server-rendered
table with a decorative, non-functional "Export CSV" button. Rewritten as a
client page: inline stock editing (blur-to-save via the existing
`PATCH .../variants/{id}/stock`), a full edit form (price/MRP/stock/threshold
/batch/status, via the existing `PUT .../variants/{id}`), and Delete (the
existing soft-delete/retire). New `lib/exportCsv.ts` — a small dependency-free
CSV export (browsers/Excel open `.csv` natively; not worth pulling in a real
`.xlsx` library for a flat table) — is now wired to a real "Export CSV"
button here and on the other new list pages below. "Add new" for inventory is
intentionally still on the Products page — a new inventory row needs a
product and a packaging chosen first, which is exactly what "add pack size"
there already does; duplicating that flow here would just be two places doing
the same thing.

**4. Reviews — now deletable, deliberately *not* editable, and admin can't add new ones**

Per explicit instruction: "review should be just deletable not editable and
also admin can not add new reviews." Previously `reviews/page.tsx` rendered
hardcoded mock data (`lib/data`), not even wired to the backend. Rewrote it
end to end:
- Backend: `AdminReviewController` gained `GET /api/admin/reviews` (full
  listing, any status) and `DELETE /api/admin/reviews/{id}` (hard delete —
  reviews are the one place in this app that *is* hard-deleted, since nothing
  else references a review by id the way orders reference variants).
  `ReviewService.delete()` recomputes the product's rating rollup if the
  deleted review had been published. Approve/reject (existing moderation
  actions, not content edits) were kept.
- Frontend: real list, Publish/Reject/Delete actions, CSV export. No edit
  form, no "add new" button, anywhere on this page — on purpose.

**5. Customers and Payments — built out (were "Content"-style placeholder stubs)**

Both previously fell through to `app/admin/(protected)/[section]/page.tsx`,
a generic "this screen follows the same pattern as Products" placeholder.
- **Customers** (`app/admin/(protected)/customers/page.tsx`, new): list, edit
  name/email (`PUT /api/admin/customers/{id}`, new), and delete — which
  **deactivates** rather than hard-deletes (`PATCH .../deactivate` /
  `.../reactivate`, new), same soft-delete reasoning as the rest of the app:
  a customer's past orders reference their id and must stay resolvable. Added
  a `customer.active` column (`V5__customer_active_and_review_index.sql`) and
  `AuthService.verifyOtp` now rejects login for a deactivated customer. No
  "add new customer" button — customers create themselves by signing in or
  checking out; a hand-added customer record isn't a real thing to manage.
- **Payments** (`app/admin/(protected)/payments/page.tsx`, new):
  **read-only**, per explicit instruction — "payment should not be editable
  it should show only payments which are done." New
  `AdminPaymentController`/`GET /api/admin/payments` returns only
  `CAPTURED`/`REFUNDED` payments (a `CREATED`/`AUTHORIZED`/`FAILED` row never
  completed real money movement, so it isn't "done"), joined with the
  order number and customer name. `PaymentRepo` gained
  `findCompletedWithOrderInfo` — `Payment.orderId` isn't a mapped relation,
  so this is a plain cross-entity JPQL join. Refunding still only happens
  from the Orders screen, through Razorpay.

**6. Removed the "Content" and "Settings" tabs**

The user asked ("I guess there is not use of admins settings and content
tabs") — checked, and unlike Customers/Payments these two had no real data
model behind them at all (no CMS entity, no settings entity), so there was
nothing to build out. Removed from `ADMIN_NAV` (`lib/content.ts`). **Admins**
was kept — that's a real, working `SUPER_ADMIN`-only feature (managing other
admin logins), not a stub.

**Verification**

- Backend: syntax-only `javac` across the full source tree (Maven Central
  still isn't reachable from this sandbox) — zero parser errors.
- Frontend: `tsc --noEmit` against a scoped tsconfig covering every
  changed/new file. Zero `TS1xxx` (syntax) errors. The only errors reported
  are the same classes of noise seen in unmodified, pre-existing files too
  (`Footer.tsx`, `Navbar.tsx`) — missing `@types/react`/`@types/node` because
  `npm install` isn't reachable in this sandbox either. Worth a real
  `npm run typecheck` + `mvn compile` locally before merging, same caveat as
  every previous entry here.

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
