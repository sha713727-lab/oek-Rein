# Zermae Database

PostgreSQL is the only database. Schema changes live here and are applied by the Backend migrate job.

```text
Database/
├── migrations/   ordered SQL applied once
├── schema/       notes for the live schema
└── seeds/        seed notes (admin seed runs from Backend)
```

## Migrate

From the repo root:

```bash
npm run db:migrate
```

Or from `Backend/`:

```bash
npm run migrate
```

Migrations are recorded in `schema_migration`. Do not delete applied files.

## Seed

```bash
npm run db:seed
```

This creates the admin account from Backend environment variables (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`).
