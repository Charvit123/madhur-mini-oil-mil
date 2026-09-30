# Madhur Mini Oil Mill — backend (Spring Boot 4)

Catalogue + orders + real Razorpay payments and refunds + OTP customer auth +
role-based admin logins. Self-contained: no external identity provider, no
manual JWKS setup — auth is a locally signed JWT (see `config/JwtConfig.java`
/ `JwtIssuer.java`). No coupon system: discounting lives entirely at the
catalogue level (each `ProductVariant`'s price vs mrp), not through order-level codes.

## Quick start

Needs a Postgres database. Use whichever of these you already have:

**With Docker:**
```bash
docker compose up -d db              # Postgres on localhost:5432
```

**With pgAdmin / a Postgres you already have** — no Docker needed. Open
pgAdmin's Query Tool against any server you can already see and run:
```sql
CREATE ROLE madhur WITH LOGIN PASSWORD 'madhur_dev_only';
CREATE DATABASE madhur OWNER madhur;
```
(Different name/user/password already in use? Set `DB_URL` / `DB_USERNAME` /
`DB_PASSWORD` in `.env` instead of running the SQL above — see `.env.example`.)

Then either way:
```bash
cp .env.example .env                 # then edit the Razorpay keys
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

API is up at `http://localhost:8080`. Swagger UI at `/swagger-ui.html`.
Flyway creates every table on first boot, including a seeded admin login —
see **Admin accounts** below.

The `dev` profile leaves every route open (see `SecurityConfig`'s `devFilterChain`)
so you can hit `/api/admin/**` and `/api/orders/**` without a token while wiring
up the frontend. `DevSmsSender` prints OTP codes to this console instead of
sending real SMS — watch the log after `POST /api/auth/otp/request`.

## What's here

```
catalog/     Oil → Product → ProductVariant → Packaging, reviews
customer/    Customer, Address, OTP login (AuthService issues a JWT)
adminuser/   AdminUser (role-based admin logins), AdminUserService/Controller
order/       Order, OrderItem, Payment, OrderService (pricing + stock +
             Razorpay + refunds)
payment/     RazorpayService — order creation, signature verification, refunds
config/      SecurityConfig, JwtConfig/JwtIssuer, RazorpayConfig,
             AdminAuthController, CacheConfig, RevalidationClient
```

## Auth model

Two kinds of self-issued JWT, same secret, same decoder:

- **Customer**: `POST /api/auth/otp/request {phone}` → `POST /api/auth/otp/verify
  {phone, code}` → `{ token, customer }`. Token carries `roles: ["CUSTOMER"]`.
- **Admin**: `POST /api/admin/auth/login {username, password}` →
  `{ token, admin: {...} }`. Every admin gets `roles: ["ADMIN"]`; a
  `SUPER_ADMIN` also gets `"SUPER_ADMIN"`, which is what gates admin-user
  management (see below).

Send `Authorization: Bearer <token>` on subsequent requests. Order creation
itself (`POST /api/orders`) is intentionally **public** — guest checkout,
matching the frontend's checkout flow — and links to a `Customer` record by
phone number either way.

## Admin accounts — role-based, a handful of named logins

There's no self-service admin signup and no single shared env-configured
account. `admin_user` is a real table (`adminuser.domain.AdminUser`); V4's
migration seeds exactly one row to get you started:

```
username: admin
password: admin123
role:     SUPER_ADMIN
```

**Log in with that once, then replace it** — create real named accounts for
whoever actually needs access:

```
POST /api/admin/admins           [ROLE_SUPER_ADMIN only]
  { "username": "hasmukh", "password": "…", "fullName": "Hasmukhbhai", "role": "ADMIN" }

GET    /api/admin/admins                       list everyone
PATCH  /api/admin/admins/{id}/deactivate        can't deactivate the last active SUPER_ADMIN
PATCH  /api/admin/admins/{id}/reactivate
```

Two roles, nothing more granular than that on purpose, since there are only
ever a few people here:
- **ADMIN** — everything operational: catalogue, orders, refunds, reviews.
- **SUPER_ADMIN** — ADMIN plus creating/deactivating other admin logins.

`@PreAuthorize("hasRole('SUPER_ADMIN')")` on `AdminUserController` is a real,
active check now (`@EnableMethodSecurity` is on) — enforced both there and
again at the URL level in `SecurityConfig` (`/api/admin/admins/**`).

## Orders & payments

`OrderService#createOrder` is where the trust boundary lives:

1. The request carries only `{variantId, quantity}` pairs. Every price and
   total is looked up from `ProductVariant` and computed here — never taken
   from the client. No coupon codes; the only discounting is whatever a
   variant's `mrp` vs `price` already says.
2. Stock is reserved with `ProductVariantRepo#reserve`, an atomic
   `UPDATE ... WHERE stock >= :qty`. If any line in a multi-item order can't
   reserve, everything already reserved for that order is rolled back.
3. For UPI/card/netbanking, a Razorpay order is created and its `order_id` +
   `amount` (in paise) + your public key ID are returned for the frontend to
   open Razorpay Checkout with. COD skips the gateway entirely.
4. `POST /api/orders/{id}/verify-payment` checks the signature Razorpay's
   widget returns. `POST /api/payments/webhook` is the same verification
   again, server-to-server — configure this URL in the Razorpay dashboard so
   a payment that captures after the browser tab closes still confirms the
   order.
5. `OrderCleanupScheduler` runs every 10 minutes and cancels + releases stock
   for any order still `PENDING_PAYMENT` after 30 minutes.

### Refunds are real, not a status flip

`POST /api/admin/orders/{id}/refund` [`ROLE_ADMIN`]:

- For a gateway-paid order (UPI/card/netbanking), this calls Razorpay's
  refund API (`RazorpayService#refundPayment`) for the order's captured
  payment, for the full order total. The `Payment` row gets
  `status=REFUNDED`, `refundedAmount`, and the real `razorpayRefundId` back
  from Razorpay — this actually moves money, it isn't decorative.
- For COD, nothing was ever collected through the gateway, so there's
  nothing to call — the order is marked `REFUNDED` to reflect a cash refund
  handled off-system.
- Only orders in `PAID`, `PACKED`, `DISPATCHED`, or `DELIVERED` can be
  refunded, and only once.
- Stock is **not** auto-released on refund — a returned tin's condition
  needs a human to look at before it goes back on sale. Adjust stock
  manually via the existing stock endpoint if appropriate.

## Environment variables

See `.env.example`. The ones you actually need to change before this is real:

| Variable | Why |
|---|---|
| `JWT_SECRET` | 32+ chars, `openssl rand -base64 48` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | from the Razorpay dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | set when you configure the webhook URL there |
| `FRONTEND_URL` | CORS + the admin cache-revalidation webhook target |

Admin credentials are **not** an env var anymore — see **Admin accounts** above.

## API surface

```
POST /api/auth/otp/request              {phone}
POST /api/auth/otp/verify               {phone, code} -> {token, customer}

GET    /api/account/addresses           [ROLE_CUSTOMER]
POST   /api/account/addresses
DELETE /api/account/addresses/{id}

POST /api/orders                        guest or authenticated
GET  /api/orders/{id}
GET  /api/orders/by-number/{orderNumber}
POST /api/orders/{id}/verify-payment
GET  /api/orders/mine                   [authenticated]

POST /api/payments/webhook              Razorpay server-to-server, signature-checked

POST /api/catalogue/reviews             public review submission (lands PENDING)

POST   /api/admin/auth/login            -> {token, admin}
GET    /api/admin/admins                [ROLE_SUPER_ADMIN]
POST   /api/admin/admins
PATCH  /api/admin/admins/{id}/deactivate
PATCH  /api/admin/admins/{id}/reactivate

GET    /api/admin/orders                [ROLE_ADMIN]
PATCH  /api/admin/orders/{id}/status
POST   /api/admin/orders/{id}/refund
GET    /api/admin/customers
GET    /api/admin/reviews/pending
POST   /api/admin/reviews/{id}/approve
POST   /api/admin/reviews/{id}/reject
```

Plus everything from the earlier catalogue pass under `/api/catalogue/**` and
`/api/admin/catalogue/**`.

## Wiring this to the frontend

`web/lib/api.ts`'s `NEXT_PUBLIC_API_URL` points the whole Next.js app at this
service — set it in `web/.env.local` and restart the dev server. Checkout
(`web/app/checkout/CheckoutClient.tsx`), customer login (`/account`), and
admin login (`/admin/login`) are all wired against these real endpoints.
