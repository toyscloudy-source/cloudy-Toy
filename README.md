# Cloudy-Toy
Status: Phases 1-2 (storefront, demo catalog, cart) plus the Phase 3 SQL schema/RLS.
## Run
npm install; npm run dev   (PowerShell and bash both work)
## Notes
- Catalog uses clearly labelled DEMO data in lib/products.ts until Supabase queries replace it.
- Schema: supabase/migrations/0001_init.sql (apply with `supabase db push`). Writes to orders/payments/stock are service-role only by design.
- No payment is processed; checkout is not built yet and nothing can report a payment as verified.
- Still to build: Google OAuth + accounts, admin + image upload adapter, checkout + KHQR, email outbox, realtime, tests, deployment guide.

## Commands (PowerShell and bash)
    npm install
    npm run dev          # http://localhost:3000
    npm test             # 31 unit tests (admin allowlist, redirects, transitions, pricing, image validation, payment rules)
    npm run typecheck
    npm run lint
    npm run build
    npm run check        # typecheck + lint + test + build in one go
Copy .env.example to .env.local and fill it in. Google sign-in needs Supabase + Google OAuth set up first.

## Admin (Phase 4)
- Only **toyscloudy@gmail.com** (verified Google account) is admin; set in `lib/admin-pure.ts`. Admin login at `/admin/login` opens the dashboard only. The admin email can never use `/account` (it redirects to `/admin`).
- Dashboard `/admin`, Orders, Transactions (low/high sort, status + date filters), Products (create/edit/hide/delete, images, price, stock), Stock (low/out alerts, quick update), Settings.
- Exports (CSV + PDF): `/api/admin/export?type=orders|transactions|products|stock&format=csv|pdf` (admin only; 404 otherwise). PDF is Latin-only; use CSV for Khmer.
- Images from `public/img/`: `qr-pay.png` (payment QR shown at checkout) and `logo.png` (default logo). The logo can be changed from Admin > Settings > Shop logo; `qr-pay.png` is still changed by replacing the file.
- **Permanent realtime database (Supabase).** Products, orders, settings and product images are stored in Supabase Postgres/Storage, so nothing is lost on restart or redeploy; data is removed only when the admin deletes it. The admin dashboard and the storefront update live (Supabase Realtime) when anything changes, with a 30 s refresh as a safety net.
- Setup: create a Supabase project, put the 3 keys in `.env.local`, run `supabase db push` (applies `0001_init.sql` and `0002_realtime_store.sql`). Optional demo products: run `supabase/seed.sql` once. Stock changes are atomic in the database (no overselling).
- Checkout is guest-friendly: orders no longer require a signed-in user.

- **Discount**: in Admin > Products, each product has optional Discount % (10 to 50) + Discount code. Customers get that % off only by typing the code at checkout; otherwise full price.
- **Per-product discount**: in Admin > Products > edit, set 'Discount % (10 to 50) + Discount code. Customers get that % off that product only by typing the code at checkout; otherwise full price (migration 0005). Store-wide codes remain under Admin > Discounts.
- Products added in the last 14 days show a **New** badge, and the shop lists the newest products first.
- **Speed**: storefront reads are cached and refresh instantly when admin/checkout changes data; uploaded photos are auto-shrunk to 1200px WebP. For real speed test with `npm run build && npm start` (`npm run dev` is much slower by design).

## Deploy
See `DEPLOY_CLOUDFLARE.md` for the full Cloudflare Workers + Supabase guide.
