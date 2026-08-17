# Zermae

Zermae uses a Next.js Frontend, a Node.js Backend, and PostgreSQL Database. The previous MARHAS/MongoDB backend is not part of the application.

```text
ZERMAE
│
├── Frontend/     Next.js 16  → :3000
├── Backend/      Node.js API → :5000
└── Database/     PostgreSQL migrations and seeds
```

```text
Customer Browser
       │
       ▼
Frontend/ Next.js :3000
       │
       │ HTTP API
       ▼
Backend/ Node.js :5000
       │
       ▼
Database/ PostgreSQL
```

## Development

Install each layer, copy the example env files, then start both apps from the repo root.

```bash
cd Backend && cp .env.example .env && npm install
cd ../Frontend && cp .env.example .env && npm install
cd ..
npm run db:migrate
npm run db:seed
npm run dev
```

| Process | Port |
|---|---|
| Frontend | 3000 |
| Backend | 5000 |
| PostgreSQL | value in `Backend/.env` `DATABASE_URL` |

`HMAC_SIGNING_SECRET` must match in `Frontend/.env` and `Backend/.env`. The Frontend uses it only on the Next.js server to sign API requests. Do not expose secrets with `NEXT_PUBLIC_*`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Frontend and Backend |
| `npm run build` | Production typecheck/build both layers |
| `npm run start` | Start production Frontend and Backend |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run test` | Tests |
| `npm run db:migrate` | Apply `Database/migrations` |
| `npm run db:seed` | Seed the admin account |

## Environment

### Frontend

Server-only variables in `Frontend/.env`:

- `APP_URL` — storefront origin (`http://localhost:3000` in development)
- `API_URL` — Backend origin (`http://127.0.0.1:5000` in development)
- `API_PREFIX` — `/api/v1`
- `HMAC_SIGNING_SECRET` — request signing (same value as Backend)
- `SESSION_SECRET` — cart/wishlist cookie signing
- `SESSION_TTL_SECONDS`

### Backend

Owns database access, sessions, mail, uploads, and CORS. See `Backend/.env.example`.

- `DATABASE_URL` / `DATABASE_MIGRATE_URL`
- `HMAC_SIGNING_SECRET` / `SESSION_SECRET`
- `CORS_ORIGIN` — Frontend origin (`http://localhost:3000` in development)
- `API_HOST` / `API_PORT` — `127.0.0.1` / `5000`
- `UPLOAD_DIR` — shared uploads directory (`../Frontend/public/uploads` in development)

### Database

PostgreSQL credentials stay in Backend env files. They are never sent to the browser.

## Database

Migrations live in `Database/migrations` and are applied by the Backend:

```bash
npm run db:migrate
npm run db:seed
```

## Production

Deploy three layers:

1. PostgreSQL with migrations applied
2. Backend Node process on port 5000 (or behind a reverse proxy), with production `CORS_ORIGIN` / `APP_URL`
3. Frontend Next.js on port 3000, with `API_URL` pointing at the Backend

Use `Secure` cookies in production (`NODE_ENV=production`). Do not use CORS `*` for authenticated requests.
