# Mini ERP — Frontend

Inventory & Sales Management console. Vite + React + TypeScript + Tailwind CSS + Redux Toolkit + TanStack Query.

## Tech Stack

- React 18 + TypeScript, Vite
- React Router v6
- Redux Toolkit (auth session + theme)
- TanStack Query (server state — data fetching, caching, mutations)
- Tailwind CSS with a hand-crafted component library (Button, Input, Card, Modal, Pagination, Badge)
- react-hook-form + zod (form validation)
- recharts (revenue trend chart)
- jsPDF + jspdf-autotable (PDF export, incl. per-sale invoice)
- axios (HTTP client with automatic 401 → refresh-token retry)

> **Note on "Tailwind CSS / Shadcn"**: the spec allows either. This project uses Tailwind CSS with its own hand-rolled component primitives rather than the shadcn CLI/library — functionally equivalent (same styling approach, reusable typed components), without pulling in shadcn's own design-token system, which would conflict with this project's custom brand palette.

## Design

- Palette: paper/ink neutrals + deep indigo brand (`#2B3A67`) + ledger-gold accent (`#C99A3B`)
- Typography: Sora (headings) + Inter (body/UI)
- Compact, data-dense layout; fully mobile-responsive (collapsible sidebar → slide-over drawer on small screens)
- Dark mode (class-based, toggle in the topbar, persisted to `localStorage`)

## Prerequisites

- Node.js 18+
- The backend API running (see backend README) and reachable at the URL you configure below

## Setup

```bash
npm install
cp .env.example .env
```

### Environment variables (`.env`)

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1` | Base URL of the backend API. Change to the deployed backend URL in production. |

### Run

```bash
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Project structure

```
src/
├── api/              # one file per resource: products, customers, sales, dashboard, users, auth
├── components/
│   ├── ui/            # Button, Input, Card, Modal, Pagination, Badge (hand-rolled, Tailwind-based)
│   ├── charts/         # RevenueTrendChart (recharts)
│   ├── Sidebar.tsx, Topbar.tsx, navConfig.ts
├── hooks/             # useAuth (permission checks), typed redux hooks
├── layouts/           # AuthLayout, DashboardLayout
├── lib/               # axios instance (with refresh interceptor), react-query client,
│                      # exportCsv, exportPdf, getErrorMessage
├── pages/
│   ├── auth/          # LoginPage
│   ├── dashboard/      # DashboardPage (stats, chart, low-stock, top-selling)
│   ├── products/       # ProductsPage (CRUD, image upload, search, pagination, CSV/PDF export)
│   ├── customers/      # CustomersPage (CRUD, search, pagination, CSV/PDF export)
│   ├── sales/          # SalesPage (create sale with live totals, history, invoice PDF)
│   └── users/          # UsersPage (Admin-only: create/update/deactivate Manager & Employee accounts)
├── routes/            # AppRoutes, ProtectedRoute (auth + permission gating)
├── store/             # Redux store, authSlice (JWT + user, persisted), themeSlice (dark mode)
└── types/             # shared frontend types matching backend response shapes
```

## Authentication & authorization

- On login, the backend returns `{ accessToken, refreshToken, user: { permissions, role, ... } }`. This is stored in Redux and persisted to `localStorage` so a refresh doesn't log the user out.
- Every request attaches `Authorization: Bearer <accessToken>` via an axios interceptor. A `401` response automatically attempts a silent refresh (`/auth/refresh`) and retries the original request once; if the refresh also fails, the session is cleared and the user is redirected to `/login`.
- `ProtectedRoute` checks both authentication and (optionally) a specific permission string, e.g. `permission="product:read"`. Sidebar navigation items are filtered the same way, so a Manager/Employee never even sees a menu item they can't access.

## Feature checklist (matches assessment spec)

- ✅ Login + protected routes
- ✅ Dashboard: stat cards (products/customers/sales/low-stock) + low-stock list — **plus bonus**: revenue-trend chart, top-selling products, all-time revenue
- ✅ Products: list, add, edit, delete, image upload, search, pagination — **plus bonus**: CSV/PDF export
- ✅ Sales: customer selection, multi-product selection, quantity input, automatic total calculation — **plus bonus**: CSV/PDF export, per-sale invoice PDF
- ✅ Users (bonus, admin-only): create/update/deactivate Manager & Employee accounts

## Deployment notes

- Any static host works (Vercel, Netlify, Render static site). Build with `npm run build`, deploy the `dist/` folder.
- Set `VITE_API_BASE_URL` to the deployed backend's URL as an environment variable in the hosting dashboard **before building** (Vite inlines `VITE_*` vars at build time, not runtime).
- Make sure the backend's `CLIENT_URL` env var matches this frontend's deployed origin, or CORS/cookies will fail.
