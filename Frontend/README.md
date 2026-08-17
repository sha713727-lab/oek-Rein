# Zermae Frontend

Next.js 16 App Router storefront. It talks to the Node Backend over HTTP. It does not connect to PostgreSQL.

## Scripts

- `npm run dev` — Next.js on port 3000
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

Copy `.env.example` to `.env` and set `API_URL`, `HMAC_SIGNING_SECRET`, and `SESSION_SECRET`. `HMAC_SIGNING_SECRET` must match Backend.

Start the Backend on port 5000 as well, or run `npm run dev` from the repository root.
