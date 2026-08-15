# Zermae

Minimal, considered skincare storefront.

| Folder | What it is |
|---|---|
| `Frontend/` | Next.js 16 app (storefront + native HTTP API) |
| `Backend/` | Previous Express API, kept as reference |

## Run the app

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

Web is on port **3000**. The API is on port **5000**.

Set `DATABASE_URL`, `HMAC_SIGNING_SECRET`, and `SESSION_SECRET` in `Frontend/.env` before running.

From the repo root you can also run `npm run dev` after installing inside `Frontend`.
