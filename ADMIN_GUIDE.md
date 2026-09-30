# Admin guide — Madhur Mini Oil Mill

This is the practical walkthrough: how to log in, how to add or remove a
product, and how an admin account is different from a customer account.
It assumes the backend (Spring Boot) and frontend (Next.js) are both
running — see the main `README.md` files in `backend/` and `web/` for
how to start them.

---

## 1. Logging in to the admin dashboard

1. Go to `/admin/login` on your site (e.g. `http://localhost:3000/admin/login`
   or your deployed domain + `/admin/login`). This page is deliberately
   **not** linked from anywhere on the public storefront — customers never
   see it.
2. Sign in with an admin **username and password** (not a phone number —
   see the difference from customer login in section 4 below).
3. The seed migration (`V4__remove_coupons_admin_users_refunds.sql`) creates
   one starting account:
   - Username: `admin`
   - Password: `admin123`
   - Role: `SUPER_ADMIN`

   **Change this password before the site goes live** — anyone who reads
   the migration file in the repo can see it. The cleanest way is to create
   a new `SUPER_ADMIN` with a real password (Admins page, see section 3),
   log in as that one, then deactivate the seeded `admin` account.
4. On success you land on `/admin/dashboard`. Every other admin page lives
   under that same `/admin/...` path and requires this login — going to
   `/admin/oils` directly without logging in redirects you back to
   `/admin/login`.
5. To log out, use the **Logout** button in the sidebar.

---

## 2. How to add a product

The catalogue has three layers, and "add a product" usually means working
through the first two of them:

```
Oil Category  →  Product  →  Variant (the actual thing for sale)
  "Groundnut"     "Double         "15 Kg Tin", priced at ₹1,850
                   Filtered
                   Groundnut Oil"
```

- **Oil category** — the top-level type (Groundnut, Sesame, Cottonseed, …).
  You only add a new one of these if you're selling an oil you don't
  already carry at all.
- **Product** — a specific recipe under an oil, e.g. "Double Filtered
  Groundnut Oil" vs "Cold Pressed Groundnut Oil". Most of the time you
  already have the product you want and don't need a new one.
- **Variant** — one pack size of one product, e.g. that product in a
  "15 Kg Tin". **This is what actually shows up for sale and what
  customers add to cart.** Adding a new pack size to an existing product
  is the single most common "add a product" task.

### Step by step: adding a brand-new product in an existing oil

1. Go to **Products** in the admin sidebar.
2. Under **Products (recipes)**, click **Add product**.
3. Fill in:
   - Oil category (pick from the dropdown — it must already exist)
   - Name (e.g. "Cold Pressed Groundnut Oil")
   - Slug auto-fills from the name — this becomes the URL
     `/product/cold-pressed-groundnut-oil`
   - Short description, full description (optional but recommended)
4. Click **Create product**. It now exists, but **has no pack sizes yet —
   it won't show up anywhere for sale until you add at least one variant.**
5. Scroll down to **Pack sizes (variants)**, click **Add pack size**.
6. Pick the product you just created, pick a packaging (e.g. "15 Kg Tin" —
   see below if the pack size you need doesn't exist yet), set the price,
   optionally an MRP (for a "was/now" discount display), and the starting
   stock count.
7. Click **Create pack size**. The product is now live on the storefront
   within a few seconds (the frontend caches catalogue data briefly and
   revalidates automatically).

### Step by step: adding a new pack size to an existing product

If the product already exists and you just want to sell it in a new size
(e.g. you already sell "Double Filtered Groundnut Oil" in a 15 Kg Tin and
now want a 5 Litre Tin too):

1. Go to **Products** → **Pack sizes (variants)** → **Add pack size**.
2. Pick the existing product, pick the pack (if "5 Litre Tin" doesn't
   exist as a packaging option yet, add it first — see below).
3. Set price, stock, and save. Done — no need to touch the product itself.

### Adding a new packaging/container type

If you need a container size that doesn't exist yet (e.g. a "2 Litre Jar"
you've never offered before):

1. Go to **Packaging** in the sidebar → **Add packaging**.
2. Fill in name ("2 Litre Jar"), a unique code ("JAR-2L"), container type,
   size and unit.
3. Save. It's now available to pick when creating or editing any variant,
   for any product.

---

## 3. How to remove (retire) a product

**Nothing in this system is ever hard-deleted from the database.** Every
"remove" is a **soft delete** — the row is marked `active: false` and
disappears from the storefront, but stays in the database so that anyone
who already ordered it still has a resolvable order history (order
confirmations, invoices, and the admin Orders screen keep working
correctly forever, even for a product you stopped selling last year).

- **To stop selling one pack size** (most common): go to **Products** →
  **Pack sizes (variants)**, find the row, click **Retire**. That one pack
  size disappears from the storefront; other pack sizes of the same
  product are unaffected.
- **To stop selling an entire product** (all its pack sizes at once): go
  to **Products** → **Products (recipes)**, find the row, click
  **Retire**. The product and everything under it disappears from the
  storefront.
- **To stop selling an entire oil category**: go to **Oils**, click
  **Retire** on that oil. Its category page, shop filter and footer link
  all disappear.

**To undo a retirement:** click **Edit** on the retired row (it still
shows up in the admin list, just tagged "Retired"), change **Status**
back to **Active**, and save. It's live again immediately.

---

## 4. Admin vs. customer account — what's actually different

These are **two completely separate account systems** that happen to live
in the same database. There's no overlap and no way for one to turn into
the other.

| | **Customer** | **Admin** |
|---|---|---|
| How they sign in | Phone number + OTP (one-time code sent to their phone) | Username + password |
| Where they sign in | `/account` | `/admin/login` |
| What they can see | Their own orders, their own addresses/profile | Every order, every customer, the whole catalogue, refunds, other admin accounts (if `SUPER_ADMIN`) |
| Account table | `customer` | `admin_user` |
| Token they get after signing in | A JWT with `roles: ["CUSTOMER"]` | A JWT with `roles: ["ADMIN"]` (plus `"SUPER_ADMIN"` for super admins) |
| Who can create the account | Anyone — self-service, just verify your phone | Only a `SUPER_ADMIN`, from the **Admins** page. There is no public admin sign-up page anywhere. |
| What the backend checks | `hasRole('CUSTOMER')` on customer-only routes (like "my orders") | `hasRole('ADMIN')` on everything under `/api/admin/**`; a stricter `hasRole('SUPER_ADMIN')` on `/api/admin/admins/**` specifically |

**Why two roles of admin (`ADMIN` and `SUPER_ADMIN`)?** An `ADMIN` can run
the shop day to day — manage the catalogue, process orders, issue refunds,
moderate reviews. Only a `SUPER_ADMIN` can create or deactivate *other*
admin logins (Admins page), so that handing someone day-to-day access
doesn't also hand them the ability to lock everyone else out or create
new admin accounts for themselves. The system won't let you deactivate
the very last active `SUPER_ADMIN` — there's always at least one account
that can manage the others.

**A customer can never do anything an admin can, and vice versa** — a
customer's OTP-issued token is rejected by every `/api/admin/**` endpoint,
and an admin's username/password token doesn't work as a customer session
on the storefront. They're deliberately kept apart so a bug or a leaked
token in one system can't reach into the other.
