# Zermae Backend

Node.js TypeScript API for Zermae. This is the only application/API layer.

```text
Frontend (Next.js :3000)
        │
        ▼ HTTP API
Backend (Node.js :5000)
        │
        ▼
PostgreSQL
```

The previous MARHAS/MongoDB backend is not part of the application.

## Run

```bash
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

The API listens on `API_HOST`:`API_PORT` (development default `127.0.0.1:5000`).

CORS allows the Frontend origin from `CORS_ORIGIN` and `APP_URL`. Authenticated requests do not use `*`.

Sessions use the HttpOnly `zermaeSession` cookie. Requests are HMAC-signed by the Frontend server.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the API |
| `npm run migrate` | Apply `Database/migrations` |
| `npm run seed` | Seed the admin account |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run test` | Unit/integration tests |
| `npm run build` | Production typecheck |

## Uploads

`UPLOAD_DIR` should point at the shared storefront uploads directory (development default `../Frontend/public/uploads`) so existing `/uploads/...` URLs keep working.
