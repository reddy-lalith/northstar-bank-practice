# Northstar Bank

Customer-facing web app for Northstar Bank: account balances and activity, internal transfers, credit card payments, virtual card numbers, cashback rewards and bill pay.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router (`web/`) |
| Backend | Node, Express 4, TypeScript, Zod (`server/`) |
| Data | In-memory store seeded on boot (`server/src/db`) |
| Tests | Vitest + Supertest (`server/test`) |

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:4000/api

Demo login: `alex@northstar.dev` / `password123`

Data lives in memory and is re-seeded every time the server restarts.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | API + web with hot reload |
| `npm test` | Server test suite |
| `npm run typecheck` | Type-check server and web |

## Backend layout

```
server/src
  app.ts              Express app factory (middleware + routers)
  index.ts            Seeds the store and starts the HTTP server
  config.ts
  db/                 In-memory store and seed data
  models/             Domain types
  repositories/       Data access (return copies, never live references)
  services/           Business logic
  routes/             HTTP handlers, request validation
  middleware/         Auth, validation, logging, error handling
  utils/              Money, dates, pagination, ids, Luhn, errors
```

Request flow: `routes/*` validate input with Zod, call a service, and return JSON. Services own business rules and call repositories. Repositories return cloned objects, so a change is only saved when you call the repository's `update`/`insert`.

## Domain notes

- All money is stored as integer cents. The API accepts dollar amounts and converts with `toCents`.
- `CHECKING` and `SAVINGS` balances are funds on deposit. `CREDIT` balance is the amount owed; available credit is `creditLimitCents - balanceCents`.
- A transfer into a `CREDIT` account is a card payment and reduces the amount owed.
- Virtual cards can be locked to one merchant (`merchantLock`), capped (`spendLimitCents`) and/or single-use (`singleUse`). A single-use card moves to `USED` after its first approved purchase.
- `POST /api/simulate/authorize` acts as a merchant terminal so you can test card purchases locally. It does not require a login.
- Cashback: 3% dining, 2% groceries and travel, 1% everything else. Credit card purchases only; refunds reverse cashback.

## API

All routes except login, health and simulate need `Authorization: Bearer <token>`.

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/auth/me` | |
| GET | `/api/accounts` | Balances + available funds |
| GET | `/api/accounts/:id` | |
| GET | `/api/accounts/:id/transactions` | `?page=1&pageSize=10&type=PURCHASE` (pages start at 1) |
| GET | `/api/transactions/recent` | `?limit=5` across all accounts |
| POST | `/api/transfers` | `{ fromAccountId, toAccountId, amount, memo? }` |
| GET | `/api/cards` | Numbers masked |
| POST | `/api/cards/virtual` | `{ accountId, nickname, merchantLock?, singleUse?, spendLimit? }` |
| GET | `/api/cards/:id` | Includes full number |
| GET | `/api/cards/:id/transactions` | |
| POST | `/api/cards/:id/close` | |
| GET | `/api/rewards/summary` | |
| POST | `/api/rewards/redeem` | `{ accountId }` |
| GET | `/api/payees` | |
| POST | `/api/payees` | `{ name, accountLast4, category }` |
| POST | `/api/payees/pay` | `{ payeeId, fromAccountId, amount, memo? }` |
| GET | `/api/audit` | `?page=1` |
| GET | `/api/notifications` | |
| POST | `/api/simulate/authorize` | `{ cardNumber, merchant, amount, category? }` |
