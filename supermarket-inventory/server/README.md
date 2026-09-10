# StockYard API

The backend for StockYard — a lean Express + MongoDB/Mongoose REST API with JWT
authentication and a WebSocket feed for real-time stock updates.

## Setup

Requires Node.js 18+ and a MongoDB instance (local `mongod` or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

```bash
cd server
cp .env.example .env   # then fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

The API + WebSocket server starts on `http://localhost:4000` by default (see `.env`).
The frontend (`../`) automatically tries to connect to `ws://localhost:4000` for
live updates — no extra config needed if you use the default port.

## Endpoints

| Method | Route                        | Auth           | Description                                  |
|--------|------------------------------|----------------|-----------------------------------------------|
| GET    | `/health`                    | —              | Server health check                          |
| POST   | `/api/auth/register`         | —              | Create an account, returns a JWT             |
| POST   | `/api/auth/login`            | —              | Log in, returns a JWT                        |
| GET    | `/api/auth/me`                | Bearer token   | Get the logged-in user's profile             |
| GET    | `/api/products`              | —              | List products (supports `?search=&category=&status=`) |
| GET    | `/api/products/:id`          | —              | Get a single product                         |
| POST   | `/api/products`              | Bearer token   | Create a product                             |
| PUT    | `/api/products/:id`          | Bearer token   | Update a product                             |
| PATCH  | `/api/products/:id/stock`    | Bearer token   | Adjust stock (`direction: "in"|"out"`) — broadcasts over WebSocket |
| DELETE | `/api/products/:id`          | Admin role     | Delete a product                             |

## Validating the API

A ready-to-import Postman collection is at `postman/StockYard.postman_collection.json`.
Import it into Postman, run **Register** (or **Login**) first — the collection script
automatically saves the returned JWT into `{{token}}` for every protected request below it.

## Real-time updates (WebSocket)

Any client can connect to `ws://localhost:4000` to receive live JSON events —
no auth required for reading the feed (only for triggering writes via the REST API):

```json
{ "type": "stock:update", "payload": { "id": "...", "name": "...", "quantity": 128, "direction": "in", "reason": "Supplier Restock" } }
```

Event types: `connection:ack`, `product:created`, `product:updated`, `product:deleted`, `stock:update`.

## How this maps to the lab experiments

- **Exp 4 — REST API + MongoDB/Mongoose:** `src/models/*.js` define schemas with
  validation; `src/routes` + `src/controllers` implement standard REST CRUD.
- **Exp 5 — Secure, production-ready APIs:** `helmet`, `cors`, `express-rate-limit`,
  `express-validator` input validation, and a centralized error handler
  (`src/middleware/errorHandler.js`) that never leaks stack traces to clients.
- **Exp 6 — Authentication & roles with JWT:** `src/models/User.js` hashes passwords
  with bcrypt; `src/controllers/authController.js` issues JWTs; `src/middleware/auth.js`
  verifies tokens and gates routes by role (`requireRole('admin')` on delete).
- **Exp 7 — Validating RESTful APIs with Postman:** see the Postman collection above.
- **Exp 8 — Real-time features with WebSockets:** `src/index.js` runs a `ws`
  WebSocket server alongside Express; the stock-adjust endpoint broadcasts every
  change so connected clients update instantly.
