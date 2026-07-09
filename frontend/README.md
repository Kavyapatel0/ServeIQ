# ServeIQ Frontend

Phase 1 — Foundation + Authentication + Layout.

React 19 + Vite, Tailwind CSS v4, shadcn/ui-style components, Redux Toolkit,
React Router v7, React Hook Form + Zod, Axios, Socket.IO client, Framer Motion,
Sonner, Day.js, Lucide React, Recharts, TanStack Table.

## Setup

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies every `/api/*`
request to `http://localhost:5000` (see `vite.config.js`), so make sure the
backend is running first:

```bash
# in the project root, in a separate terminal
npm run dev
```

Then open `http://localhost:5173/login` and sign in with any seeded user,
e.g. `admin@restaurant.com` / `admin123` (see `database/02_seed_data.sql`
for the full list of seeded users and roles).

## Environment variables

Copy `.env.example` to `.env` only if you need to point at a
non-local backend (production deploys). Local development needs no `.env`
at all — the Vite proxy handles everything.

## What's in Phase 1

- **Auth**: JWT login backed by `POST /api/auth/login`, session restore via
  `GET /api/auth/me` on page refresh, logout via `POST /api/auth/logout`.
  Token is stored in `localStorage` and attached to every request by an
  Axios interceptor (`src/services/axios.js`).
- **RBAC-aware UI**: the sidebar (`src/layouts/Sidebar.jsx`) and route guards
  (`src/routes/ProtectedRoute.jsx`) filter by the same `permission_key`
  strings the backend uses (`src/constants/permissions.js`), so a Waiter and
  a Super Admin see a different sidebar without any role-name branching.
- **Layout**: collapsible dark-navy sidebar, top navbar with search/
  notifications/profile menu, breadcrumbs, responsive down to mobile.
- **Design system**: `src/components/ui/` — Button, Input, Label, Card,
  Badge, Dialog, DropdownMenu, Avatar, Select, Separator, Skeleton — all
  built on Radix primitives + `class-variance-authority`, styled from the
  design tokens in `src/index.css`.
- **State**: Redux Toolkit slices for auth, sidebar/theme UI state, selected
  branch (for Super Admin's multi-branch view), and notifications.
- **Sockets**: `SocketContext` connects once authenticated and joins the
  user's `branch_<id>` room, matching the backend's `src/sockets/socket.js`.
  No listeners are attached yet — that starts in the Kitchen frontend phase.
- **Placeholder module pages**: POS, Kitchen, Inventory, CRM, Analytics, and
  Admin all have a route, a sidebar entry, and a permission gate already
  wired up, showing a consistent "coming soon" state until their real
  frontend phase is built.

## Folder structure

```
src/
  components/
    ui/        — design-system primitives (Button, Card, Dialog, ...)
    common/     — app-specific reusable pieces (PageHeader, StatCard, ...)
  layouts/       — Sidebar, Navbar, Footer, DashboardLayout, AuthLayout
  pages/          — one folder per module, mirrors the sidebar
  hooks/          — useAuth, usePermission, useMediaQuery
  redux/          — store.js + slices/
  services/       — axios.js (API client), auth.service.js, socket.js
  utils/          — cn.js, format.js, permissions.js
  types/          — shared JSDoc typedefs (this is a JS, not TS, project)
  assets/         — imported static assets (empty until a module needs one)
  constants/      — routes.js, permissions.js, navigation.js
  routes/         — AppRoutes.jsx, ProtectedRoute.jsx
  contexts/       — SocketContext.jsx
```

## Next phases

Phase 2 (Dashboard) replaces the placeholder KPI cards in
`src/pages/dashboard/DashboardPage.jsx` with live data from
`/api/analytics`, `/api/orders`, `/api/kitchen/dashboard`, and
`/api/crm/dashboard`. Phases 3–8 build out POS, Kitchen, Inventory, CRM,
Analytics, and Administration on top of this same shell — see
`ROADMAP.md` in the project root for the full plan.
