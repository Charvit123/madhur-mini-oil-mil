# Madhur Mini Oil Mill — storefront + admin (Next.js)

A full port of the prototype into a real Next.js 15 / React 19 / TypeScript
project. **Runs with zero external services**: `app/api/catalogue/**` route
handlers serve the same seed data the prototype used, so `npm install && npm
run dev` is the whole setup.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — storefront at `/`, admin at `/admin`.

## Pointing at the real Spring Boot backend instead

Nothing in the UI changes — only `lib/api.ts`'s base URL does:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

With that set, every `api.*()` call in `lib/api.ts` hits the Java service
under `../backend` instead of this project's own route handlers. Both speak
the identical JSON shape (see `lib/types.ts`), so no component, page or store
needs to change.

**This is required, not optional, for checkout, customer login, and every
admin page** — placing an order, OTP sign-in, and all `/admin/*` screens talk
to the real backend directly (`lib/order.ts`, `lib/auth.ts`, `lib/adminAuth.ts`,
`lib/adminApi.ts`), because those need real persistence that has no local
mock. Without `NEXT_PUBLIC_API_URL` set, those parts show a clear error
explaining that, rather than failing silently — but the storefront (browsing,
search, filters) still works fully self-contained either way.

## Where things live

```
app/
  layout.tsx              Navbar + Footer + CartDrawer + Toaster, fonts
  page.tsx                Home
  shop/page.tsx            Shop landing (server) + ShopClient.tsx (filters, live grid)
  shop/[oilSlug]/page.tsx  Oil category page
  product/[slug]/          Product detail (server) + ProductDetailClient.tsx
  cart/page.tsx            Full cart page
  checkout/                5-step checkout: real order creation, real Razorpay
                           Checkout widget, real payment verification
  about/, contact/, legal/
  account/page.tsx          Real two-step OTP login + order history
  admin/
    login/page.tsx           Standalone — outside the (protected) group below
    (protected)/              Everything else; gated by RequireAdmin
      layout.tsx               Sidebar chrome + RequireAdmin wrapper
      AdminSidebar.tsx          Active-link highlighting, shows the signed-in
                                admin, log out
      dashboard/, oils/, packaging/, products/, inventory/, reviews/
      orders/page.tsx           Live orders, status changes, real refunds
      admins/page.tsx           Admin-user management (SUPER_ADMIN only —
                                UI-gated here, actually enforced by the backend)
      [section]/page.tsx        Stub for the screens not built out yet
  api/catalogue/**         Local, dependency-free catalogue API (browsing only —
                           orders/auth/admin always hit the real backend)
  revalidate/route.ts      Webhook target for the Spring admin's cache eviction

components/                ProductCard, VariantSelector, CartDrawer, Navbar,
                           RequireAdmin, …
lib/
  data.ts                  Seed data, ported 1:1 from the prototype's DB object
  catalogue.ts             Query logic over data.ts (mirrors the Spring service)
  api.ts                   Server-side fetch wrapper (same-origin by default)
  order.ts                 Client-side order/checkout calls — real backend only
  auth.ts                  Client-side customer OTP calls — real backend only
  adminAuth.ts             Client-side admin login — real backend only
  adminApi.ts              Client-side admin data calls (orders, admin users)
  types.ts                 Wire types, mirrors backend/.../CatalogueDtos.java
  content.ts                Static site copy (WHY, PROCESS, TESTIMONIALS, FAQ…)
store/
  cart.ts                  Zustand + persist, cartTotals()
  auth.ts                  Customer session (separate from admin — see below)
  adminAuth.ts             Admin session, its own localStorage key
styles/tokens.css           Design tokens as CSS variables (same palette as prototype)
```

## Auth — two separate sessions, two separate stores

Customer and admin are different principals with different localStorage keys
(`madhur.auth` vs `madhur.admin-auth`) — a customer being signed in never
implies anything about admin access, and vice versa. Both stores use the same
hydration-flag pattern (`hydrated` starts `false`, flips `true` once
zustand's `persist` middleware finishes reading localStorage) so a page that
checks "is there a session?" on first render doesn't see a false
"logged out" flash for someone who actually has one.

`RequireAdmin` (wrapping the `admin/(protected)` route group) is a **UI
convenience**, not the real security boundary — every admin endpoint
independently enforces its own auth on the backend (`SecurityConfig` +
`@PreAuthorize`) regardless of what this component does.

## Swapping the mock data for a real database later

Everything downstream of `lib/catalogue.ts` only knows about the DTO shapes
in `lib/types.ts`. To go from the bundled mock data to Postgres (or to the
Spring backend), you have two options that require touching **nothing** in
`app/` or `components/`:

1. **Point at the Spring backend** — set `NEXT_PUBLIC_API_URL` (see above).
2. **Replace `lib/data.ts` + `lib/catalogue.ts`** with real queries and keep
   the route handlers in `app/api/catalogue/**` as-is.

## Scripts

```bash
npm run dev         # start dev server
npm run build        # production build
npm run start        # run the production build
npm run lint          # eslint
npm run typecheck     # tsc --noEmit
```
