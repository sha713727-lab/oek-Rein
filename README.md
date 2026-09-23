# Oak & Rein

Production storefront for **Oak & Rein** — Pakistani leather equestrian gear for North America.

Monorepo:

- `Frontend` — Next.js storefront + admin CMS
- `Backend` — Node API + Postgres

Repo: [sha713727-lab/oek-Rein](https://github.com/sha713727-lab/oek-Rein)

## Local development

```bash
npm install --prefix Backend
npm install --prefix Frontend
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
# For local Windows Postgres helper: set NODE_ENV=development and local DB URLs
npm run db:local
npm run db:migrate
npm run seed:admin
npm run dev
```

- Shop: http://localhost:3000  
- Admin: http://localhost:3000/admin/login (email/password from `SEED_ADMIN_*`, OTP from `ADMIN_PASSCODE`)

## Production (Hostinger VPS)

1. Point your domain DNS **A record** to the VPS IP.
2. On the VPS, clone this repo and install Node 20+, Postgres, and Nginx (or Caddy).
3. Copy env examples and fill real values (domain, DB, secrets, admin):

   ```bash
   cp Backend/.env.example Backend/.env
   cp Frontend/.env.example Frontend/.env
   ```

4. Set at minimum:

   | Variable | Where | Notes |
   |---|---|---|
   | `APP_URL` | Backend + Frontend | `https://your-domain` |
   | `CORS_ORIGIN` | Backend | Same as `APP_URL` |
   | `API_URL` | Frontend | Usually `http://127.0.0.1:5000` on the VPS |
   | `DATABASE_URL` / `DATABASE_MIGRATE_URL` | Backend | Postgres on the VPS |
   | `HMAC_SIGNING_SECRET` / `SESSION_SECRET` | Both | Long random; must match |
   | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `ADMIN_PASSCODE` | Backend | Your admin login |

5. Build and seed:

   ```bash
   npm run build
   npm run db:migrate
   npm run seed:admin
   NODE_ENV=production npm start
   ```

6. Put Nginx/Caddy in front: HTTPS → Next (`3000`), proxy `/api` → Backend (`5000`) if you expose the API on the same host.

Admin login stays env-driven — set `SEED_ADMIN_*` and `ADMIN_PASSCODE` on the server before seeding; no passwords are committed to git.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local API + Next (starts local Postgres helper when available) |
| `npm run build` | Production build |
| `npm start` | Run built Backend + Frontend (uses `DATABASE_URL` from env) |
| `npm run db:migrate` | Apply migrations |
| `npm run seed:admin` | Create/update admin from `SEED_ADMIN_*` |
