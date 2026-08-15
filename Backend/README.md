# MARHAS Backend API

Node.js REST API for the MARHAS luxury fashion e-commerce platform. Run it on localhost alongside the `frontend/` app.

## Tech Stack

- **Node.js 20+** · **Express 5** · **MongoDB** · **Mongoose**
- **JWT** access + refresh tokens with rotation
- **Zod** validation · **Pino** logging · **Swagger UI**
- **Jest + Supertest**

## Quick Start

```bash
cd Backend
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT secrets (32+ characters)

npm install
npm run seed
npm run dev
```

API: `http://localhost:5000/api/v1`  
Swagger: `http://localhost:5000/api-docs`

## MongoDB Setup

Use MongoDB Atlas or a local MongoDB instance. Copy the connection string into `.env`:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=marhas
```

For a local database:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/marhas
DATABASE_NAME=marhas
```

## Environment Variables

See `.env.example` for all options. Required:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Min 32 characters |
| `JWT_REFRESH_SECRET` | Min 32 characters |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with file watch |
| `npm start` | Start without file watch |
| `npm run seed` | Seed admin, products, CMS, orders |
| `npm test` | Run tests with coverage |

## Default Seed Credentials

```
Email: admin@marhas.com
Password: Marhas@Admin123
Role: SUPER_ADMIN
```

## API Modules

| Prefix | Description |
|--------|-------------|
| `/auth` | Register, login, refresh, password reset, sessions |
| `/products` | Catalog CRUD, search, best sellers |
| `/orders` | Guest/customer checkout |
| `/admin/orders` | Order management |
| `/admin/inventory` | Stock management + restock |
| `/admin/analytics` | Revenue, KPIs, charts |
| `/admin/dashboard` | Dashboard metrics |
| `/content` | Storefront CMS |
| `/uploads` | Image/video/document uploads |
| `/newsletter` | Email subscriptions |
| `/health` | Health + readiness |

## Response Format

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {}
}
```

## Frontend Integration

Set in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_ASSET_URL=http://localhost:5000
```

The frontend `services/api.js` already expects Bearer tokens in `luxury_token`.

## Architecture

See `docs/BACKEND_ARCHITECTURE_REPORT.md` for the full frontend audit, collection design, and API mapping.

## License

MIT
