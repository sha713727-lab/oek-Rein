# Oak & Rein — oakrein.com

Production storefront for **Oak & Rein** ([oakrein.com](https://oakrein.com)).

Monorepo: `Frontend` (Next.js) + `Backend` (Node API + Postgres).

Repo: [sha713727-lab/oek-Rein](https://github.com/sha713727-lab/oek-Rein)

## Hostinger VPS

| | |
|---|---|
| Domain | `oakrein.com` / `www.oakrein.com` |
| VPS | `srv1822663.hstgr.cloud` (Ubuntu 24.04, KVM 2) |
| IPv4 | `2.25.83.90` |
| SSH | `ssh root@2.25.83.90` |

### DNS (required)

In Hostinger DNS for `oakrein.com`, set:

| Type | Name | Value |
|---|---|---|
| A | `@` | `2.25.83.90` |
| A | `www` | `2.25.83.90` |

Remove parking / forwarding records that point elsewhere. Until the A records hit this VPS, the site will not load from this server.

### Server env (admin login)

On the VPS only (never commit):

```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
# Edit both: DATABASE_*, HMAC_*, SESSION_*, SEED_ADMIN_*, ADMIN_PASSCODE
```

Admin login after seed: `/admin/login` using `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD` + `ADMIN_PASSCODE` from `Backend/.env`.

### Deploy outline

```bash
ssh root@2.25.83.90
git clone https://github.com/sha713727-lab/oek-Rein.git /var/www/oakrein
cd /var/www/oakrein
# install Node 20+, Postgres; create DB user/db
npm install --prefix Backend && npm install --prefix Frontend
# fill Backend/.env + Frontend/.env
npm run build
npm run db:migrate
npm run seed:admin
NODE_ENV=production npm start
```

Put Nginx/Caddy in front with TLS for `oakrein.com` → Next `:3000`, and proxy `/api` → Backend `:5000` if needed.

### Deploy after this fix

Docker Compose deploy on the VPS (migrations run automatically on backend start):

```bash
ssh root@2.25.83.90
cd /var/www/oakrein  # or actual path
git pull
cd deploy/docker && docker compose build && docker compose up -d
# Include the upgrade map in nginx http{} (once):
#   include /var/www/oakrein/deploy/nginx/oakrein-map.conf;
# Ensure site config uses deploy/nginx/oakrein.com.conf (TLS) or the http-only bootstrap.
nginx -t && systemctl reload nginx
# The default hero cutout ships in Frontend/public/assets. If the published hero is still a
# plain uploaded clip, the backend converts it to the cutout once, in the background, on boot
# (set PRERENDER_HERO_ON_START=0 to skip). Regenerate the bundled default from its source with:
#   npm run prerender:hero --prefix Backend
```

## Local development

```bash
npm install --prefix Backend && npm install --prefix Frontend
cp Backend/.env.example Backend/.env   # then switch URLs to localhost
cp Frontend/.env.example Frontend/.env
npm run db:local && npm run db:migrate && npm run seed:admin
npm run dev
```

- Shop: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local API + Next |
| `npm run build` | Production build |
| `npm start` | Run built apps (uses `DATABASE_URL` from env) |
| `npm run db:migrate` | Migrations |
| `npm run seed:admin` | Create/update admin from `SEED_ADMIN_*` |
