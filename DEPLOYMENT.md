# Deploying to Hostinger (Node.js hosting)

Hostinger's "Node.js" app feature (available on Business/Cloud shared hosting
and VPS plans) runs your app via **Phusion Passenger**, which needs a plain
`.js` entry file that listens on `process.env.PORT` — it cannot invoke the
`next start` CLI directly. That's what `server.js` in this repo is for.

If you have a **VPS** instead (full root access, e.g. via SSH + PM2/systemd),
skip the Passenger-specific steps below and just run `npm run build && npm
start` like on any normal server — the plain `next start` script works fine
there.

## 1. Choose a database

SQLite (the default here) works on Hostinger's Node hosting because the
filesystem is persistent (not serverless), but shared hosting has limited
concurrent-write tolerance. For anything beyond a demo, switch to the free
MySQL database Hostinger includes with hosting plans:

1. In hPanel, create a MySQL database (Databases → MySQL Databases). Note the
   host, database name, user and password.
2. In `prisma/schema.prisma`, change the datasource:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set `DATABASE_URL` to `mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME`
   (see step 4).

To stay on SQLite instead, just make sure the app's working directory (and
therefore `prisma/dev.db`) is on persistent storage — it is by default on
Hostinger's Node hosting — and that the hosting user has write permission to
the project folder and to `public/uploads`.

## 2. Upload the code

Either connect the hPanel Node.js app to a Git repository (Git → Deploy from
GitHub, if offered on your plan) or upload the project as a zip via File
Manager and extract it into the app's root folder. Don't upload
`node_modules`, `.next`, or `prisma/dev.db` — they'll be created on the
server.

## 3. Create the Node.js app in hPanel

In hPanel → Advanced → **Node.js**:

- **Node.js version:** 18.x or newer (20.x recommended)
- **Application root:** the folder you uploaded the project into
- **Application startup file:** `server.js`
- **Application URL:** your domain/subdomain

Save — Hostinger will provision the app and give you a way to open an SSH/
terminal session or run NPM commands for that app.

## 4. Set environment variables

In the same Node.js app screen, add environment variables (or create a `.env`
file in the app root if the panel doesn't expose an env editor):

```
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"   # or file:./dev.db for SQLite
NEXTAUTH_SECRET="a-long-random-string-change-this"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

Generate a strong `NEXTAUTH_SECRET` with `openssl rand -base64 32`.

## 5. Install, build, migrate, seed

Using the terminal/NPM-command feature Hostinger gives you for the app (or
SSH if you have it):

```bash
npm install
npm run db:push        # creates tables from prisma/schema.prisma
npm run db:seed        # optional: loads demo categories/products/CMS content
npm run build           # compiles Next.js for production
```

Then start (or restart) the app from the Node.js panel — it will run
`node server.js` per the startup file you set, which listens on the port
Passenger assigns via `PORT`.

## 6. Verify

- Visit your domain — the storefront should load.
- Visit `/admin` and sign in (`admin@corium-leather.com` / `Admin@12345` if
  you ran the seed — **change this password immediately** on a real deploy).
- Try uploading a product image in `/admin/products/new` to confirm the app
  can write to `public/uploads`.

## Redeploying after code changes

```bash
git pull            # or re-upload changed files
npm install          # only if dependencies changed
npm run build
```
Then restart the app from the Node.js panel so Passenger picks up the new
build.

## Notes

- Panel field names can differ slightly by Hostinger plan/version — if your
  screen doesn't match exactly, look for "Node.js" under Advanced/Websites
  and the concepts above (startup file, app root, env vars) still apply.
- `public/uploads` and `prisma/dev.db` must be writable by the app's OS user.
  If uploads fail with a permission error, check folder ownership in File
  Manager.
- No payment gateway or SMTP is wired up out of the box — see the README's
  "Notes on scope" section before taking real orders or relying on the OTP
  password-reset flow.
