# Corium — Premium Leather Bags eCommerce Platform

A full-stack, production-architected eCommerce storefront and admin CMS for a premium
leather goods brand, built with Next.js 15 (App Router), TypeScript, Prisma and
Tailwind CSS v4.

## Stack

- **Framework:** Next.js 15 (App Router, Server Components, Route Handlers)
- **Language:** TypeScript
- **Database:** SQLite via Prisma ORM (swap the `datasource` provider for Postgres/MySQL in production)
- **Auth:** Auth.js (NextAuth v5) with credentials + bcrypt password hashing, JWT sessions, role-based access (`CUSTOMER` / `ADMIN`)
- **Styling:** Tailwind CSS v4 with a custom brand theme (CSS variables, admin-editable at runtime)
- **State:** Zustand (cart, wishlist, recently-viewed, UI state) with `localStorage` persistence where appropriate
- **Forms/validation:** react-hook-form + zod
- **Charts:** Recharts (admin dashboard)
- **Images:** A self-contained, deterministic SVG placeholder generator (`/api/placeholder`) — no third-party image CDN dependency, so the site never has broken images

## Getting Started

```bash
npm install
cp .env.example .env      # adjust NEXTAUTH_SECRET for production
npm run db:push           # create the SQLite schema
npm run db:seed           # seed 10 categories, 50 products, orders, CMS content, etc.
npm run dev
```

Visit `http://localhost:3000`.

### Deploying

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for step-by-step instructions for
Hostinger's Node.js hosting (or any Passenger-based Node host). For a VPS or
other host where you run the process yourself, `npm run build && npm start`
is all you need.

### Demo accounts

| Role     | Email                          | Password       |
| -------- | ------------------------------- | -------------- |
| Admin    | admin@corium-leather.com        | Admin@12345    |
| Customer | aarav.mehta@example.com         | Customer@123   |

Admin panel: `/admin`

### Useful scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build & serve
- `npm run lint` — ESLint
- `npm run db:seed` — re-seed demo data (destructive — clears existing data first)
- `npm run db:reset` — drop, recreate and reseed the database

## Architecture

```
src/
  app/
    (storefront)/     Public storefront routes — its own layout with header/footer
    admin/            Admin panel routes — separate layout/shell, role-gated
    api/               Route handlers (public + /api/admin/* for admin mutations)
  components/          UI components, grouped by domain (home, shop, product, admin, ...)
  lib/                 Prisma client, auth config, Zustand stores, data-fetching helpers
prisma/
  schema.prisma        Full data model
  seed.ts               Realistic demo data generator (no Lorem Ipsum)
```

The storefront and admin panel are split into separate route groups so each gets
its own layout without one inheriting the other's chrome.

## Content is fully CMS-driven

Nothing on the homepage, static pages, or navigation is hardcoded — it's all backed
by the database and editable from `/admin`:

- **Homepage Manager** — announcement bar, hero & promo banner slides, every
  section's heading/subtitle and visibility, "Why Choose Us" items, Instagram
  gallery, newsletter copy
- **Pages CMS** — About Us, Contact Us, Privacy Policy, Terms & Conditions,
  Shipping & Return Policy, FAQs
- **Settings** — branding, live-editable theme colors, social links, SEO/analytics
  IDs, payment/shipping/tax configuration, currency, SMTP
- **Media Manager** — real file uploads (stored under `public/uploads`, tracked in
  the database)
- **Products, Categories, Orders, Customers, Reviews, Coupons** — full CRUD

Admin mutations call `revalidatePath` so storefront changes appear immediately.

## Notes on scope

- **Payments** are represented as selectable methods (COD, UPI, Card, Net Banking,
  Wallet) with COD/GST fee logic; no live payment gateway is wired up. Swap in a
  real gateway server-side in `src/app/api/orders/route.ts` before going live.
- **OTP-based password reset** has no SMTP configured in this environment, so the
  generated code is surfaced directly in the UI for demo purposes — wire this to a
  real email/SMS provider (see Settings → SMTP) for production use.
- **Database** is SQLite for zero-setup local development. The schema is
  provider-agnostic Prisma; point `DATASOURCE_URL` at Postgres/MySQL and update
  `provider` in `schema.prisma` for a production deployment.
