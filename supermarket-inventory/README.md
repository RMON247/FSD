# StockYard — Supermarket Warehouse & Inventory Management

A full-stack admin dashboard for managing a supermarket's warehouse storage,
inventory, products, customers, and transactions.

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Recharts — runs on
  realistic in-memory demo data so the UI is fully populated and usable on its own.
- **Backend (`server/`):** Express, MongoDB + Mongoose, JWT auth, and a WebSocket
  server for real-time stock updates. Optional — the frontend works standalone
  without it, and automatically shows a "Live"/"Offline" indicator depending on
  whether it's running.

## Getting Started (frontend only)

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`). This is enough
to explore the whole UI — all data lives in memory for the session.

### Other commands

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build locally
npm run lint      # run ESLint
```

## Getting Started (with the backend)

See `server/README.md` for full details. Quick version:

```bash
cd server
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

With the backend running on its default port, the frontend's Topbar/Sidebar will
automatically show a live "Connected" status and real-time sync timestamp.

## What's inside (frontend)

- **Dashboard** — key metrics (products, inventory units/value, low/out-of-stock
  counts, customers), stock movement & category value charts, recent activity feeds.
- **Storage** — warehouse storage locations with capacity/usage tracking, add/edit/
  delete/view.
- **Inventory** — searchable, filterable, sortable, paginated stock table with
  low-stock warnings, stock-in/stock-out actions, and a **Reorder List** — add
  low/out-of-stock products, adjust quantities, and submit as a batch stock-in.
- **Products** — full product catalog CRUD with categories, suppliers, pricing,
  and a dedicated product detail page with movement history.
- **Customers** — customer profiles, contact info, purchase history, and status.
- **Transactions** — a full audit log of every stock movement (in/out), with
  filters by type and location.
- **Reports** — stock movement trends, inventory value by category, most/least
  stocked products, and a low-stock reorder report.
- **Settings** — appearance (light/dark/system theme), profile, and notification
  preferences.
- **Live sync indicator** — the Topbar and Sidebar show a real-time connection
  status and "last synced Xs ago" readout, backed by a WebSocket client that
  connects to the backend when available.

## Project structure

```
src/
  components/
    layout/       Sidebar, Topbar, Layout shell
    ui/            Reusable primitives: Button, Card, Badge, Table, Modal,
                    ConfirmDialog, form Fields, Pagination, EmptyState/Loading/Toast
    modals/        Feature-specific modals (Product/Storage/Customer forms,
                    Stock adjust, Reorder List)
    charts/        Recharts wrappers (stock trend, category value)
  context/
    ThemeContext.jsx      Light/dark theme — persisted via the useLocalStorage hook
    DataContext.jsx       In-memory "database" + CRUD actions for all entities
    ToastContext.jsx      Toast notification queue
    RealtimeContext.jsx   WebSocket connection to the backend + live sync clock
    ReorderCartContext.jsx  useReducer-based store powering the Reorder List
  hooks/
    useInterval.js       Custom hook wrapping setInterval (used by RealtimeContext)
    useLocalStorage.js   Custom hook syncing state to localStorage (used by ThemeContext)
  data/
    dummyData.js   Seed data generation (products, storage, customers, transactions)
  pages/           One file per route
  utils/           Formatting helpers, table sort/paginate hook

server/            Express + MongoDB/Mongoose + JWT + WebSocket API (see server/README.md)
```

## Connecting the frontend's demo data to a real backend

Right now the frontend's `DataContext` manages products/storage/customers/
transactions entirely in memory, independent of `server/`. To wire them together:

1. Replace the `useState(seedProducts)` (and similarly for storage/customers/
   transactions) initial values with data fetched from `server`'s REST endpoints.
2. Replace each mutator (`addProduct`, `updateStorage`, `adjustStock`, etc.) with
   a `fetch` call to the matching API route, then update local state from the
   response (or re-fetch).
3. Nothing in `pages/` or `components/` needs to change — they only call the
   functions exposed by `useData()`.

The WebSocket wiring (`RealtimeContext`) is already live and connects to the
backend automatically — once step 1–2 above are done, incoming `stock:update`
events can also be used to update `DataContext` state directly for true
real-time sync across multiple open dashboards.

## Notes

- Theme preference is persisted to `localStorage` via a custom hook.
- Frontend entity data (products, storage, customers, transactions) lives in
  memory for the current session only and resets on page reload, unless wired
  to the backend as described above.
- Deployment/CI-CD (GitHub Actions, Docker, Vercel/Render) is intentionally not
  included here.
