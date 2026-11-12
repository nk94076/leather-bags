# Corium — PHP / Tailwind / MySQL Edition

A full rewrite of the Corium leather-goods storefront and admin panel in vanilla
PHP 8, MySQL, and a standalone-compiled Tailwind CSS build — no Node.js
runtime required in production. This is a parallel implementation of the
Next.js app in the repository root, built for shared/classic PHP hosting.
It has full feature parity with that version **except the coupon/discount-code
system, which is intentionally omitted.**

## Stack

- PHP 8.1+ (no framework, no Composer dependencies) — front-controller +
  regex router for clean URLs, PDO/MySQL data layer, session-based auth and
  cart, server-rendered views with light vanilla-JS progressive enhancement.
- MySQL / MariaDB.
- Tailwind CSS v4, compiled to a static `public/assets/css/app.css` at build
  time — the compiled CSS ships with the repo, so the PHP host itself never
  needs Node.js. Only rebuild it (from the repo root, where the Tailwind CLI
  dependency lives) after changing any `.php` view file's class names:
  ```bash
  npm run php:css:build   # one-time build
  npm run php:css:watch   # rebuild on change, for local development
  ```

## Local development

1. Create a MySQL database and user, then copy `.env.example` to `.env` and
   fill in the DB credentials, `APP_URL` (e.g. `http://localhost:8000`), and
   `APP_NAME`.
2. Load the schema: `mysql -u <user> -p <database> < database/schema.sql`
3. Seed demo data (50 products, 10 categories, orders, reviews, CMS pages,
   settings, etc.): `php database/seed.php`
4. Start the built-in dev server from the repo root:
   ```bash
   php -S localhost:8000 -t php-app/public php-app/public/router.php
   ```
   `router.php` emulates the `.htaccess` rewrite rules so clean URLs work
   without Apache during local development.
5. Build the CSS once (from the repo root): `npm run php:css:build`

### Demo accounts (after seeding)

- Admin: `admin@corium-leather.com` / `Admin@12345`
- Customer: `aarav.mehta@example.com` / `Customer@123`

## Deployment (shared/classic PHP hosting)

For a Hostinger-specific, step-by-step walkthrough (in Hinglish), see
[`HOSTINGER_DEPLOY.md`](./HOSTINGER_DEPLOY.md). The general steps below
apply to any PHP + MySQL shared host.

1. Point the host's document root at `php-app/public`.
2. Copy `.env.example` to `.env` inside `php-app/` (one level above
   `public/`) and fill in production DB credentials and `APP_URL`.
3. Import `database/schema.sql` into the production MySQL database, then run
   `php database/seed.php` if you want the demo catalog, or write your own
   data.
4. Ensure `public/uploads/` is writable by the web server user — this is
   where the admin panel's image uploads (products, categories, banners,
   media library) are stored.
5. Confirm `.htaccess` is honored (`AllowOverride All` on Apache, or the
   equivalent rewrite-all-to-index.php rule on other servers) so clean URLs
   resolve correctly.
6. The compiled `public/assets/css/app.css` ships with the repo — no build
   step is required on the server itself.

## Project layout

```
php-app/
  public/            Web root: index.php front controller, .htaccess,
                      compiled CSS/JS, uploads/
  src/
    Auth.php, Config.php, Database.php, Router.php   Core services
    routes.php                                         All route definitions
    Helpers/         Shared functions, placeholder-image generator, constants
    Views/           Layout shells + reusable partials (header, footer,
                      product card, admin sidebar, etc.)
    pages/           One file per route — storefront pages under pages/,
                      admin panel under pages/admin/
  database/
    schema.sql       Full MySQL schema (18 tables, no coupons table)
    seed.php         CLI seed script for realistic demo data
```

## What's intentionally different from the Next.js version

- **No coupon/discount-code system** — no `coupons` table, no coupon UI in
  cart/checkout/admin, no discount fields on orders. Per explicit scope.
- Classic full-page-reload forms in place of the Next.js version's
  client-side state + fetch/AJAX flows, since this build has no SPA
  framework. A small amount of vanilla JS (`public/assets/js/app.js`)
  handles things a static form can't do well: the mobile menu, live search
  suggestions, the announcement-bar rotation, image-gallery zoom/swap,
  quantity steppers, and simple show/hide toggles.
- The Homepage Manager's repeatable content (banner slides, "Why Choose Us"
  items, Instagram gallery images) is edited via a fixed number of rows plus
  one blank "add new" row, instead of the Next.js version's dynamic
  add/remove-row UI. Still fully editable from the admin panel without code.
