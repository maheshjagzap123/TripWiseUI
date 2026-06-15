# TripWise UI — Frontend Progress Document

> **Stack:** React 19 · Vite 8 · Tailwind CSS v4 · React Router v7 · React Hook Form · Recharts · Axios · Lucide React  
> **Build status:** ✅ Passing (`npm run build` — 0 errors)  
> **Last updated:** June 15, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Folder Structure](#3-folder-structure)
4. [Routing Architecture](#4-routing-architecture)
5. [API Layer](#5-api-layer)
6. [Auth Context](#6-auth-context)
7. [Shared UI Components](#7-shared-ui-components)
8. [Layout](#8-layout)
9. [Pages — Auth](#9-pages--auth)
10. [Pages — Trips](#10-pages--trips)
11. [Pages — General](#11-pages--general)
12. [Pages — Admin](#12-pages--admin)
13. [Styling & Design System](#13-styling--design-system)
14. [What's Done vs What's Pending](#14-whats-done-vs-whats-pending)

---

## 1. Project Overview

TripWise is a smart travel finance application. The frontend is a **React SPA** that communicates with a REST API backend. It allows users to:

- Create and manage trips
- Track and split expenses across trip members
- Set and monitor budgets per category
- Settle balances between members
- Manage a shared trip wallet
- View analytics and spending trends
- Receive in-app notifications
- Admin users can manage all users, trips, and audit logs

---

## 2. Tech Stack & Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.6 | UI framework |
| `react-dom` | ^19.2.6 | DOM rendering |
| `react-router-dom` | ^7.17.0 | Client-side routing |
| `axios` | ^1.18.0 | HTTP client |
| `react-hook-form` | ^7.79.0 | Form state management & validation |
| `recharts` | ^3.8.1 | Charts (Line, Bar, Pie) |
| `lucide-react` | ^1.18.0 | Icon library |
| `tailwindcss` | ^4.3.1 | Utility-first CSS |
| `@tailwindcss/vite` | ^4.3.1 | Tailwind Vite plugin |

### Dev Dependencies

| Package | Purpose |
|---|---|
| `vite` | Build tool / dev server |
| `@vitejs/plugin-react` | React fast refresh |
| `eslint` | Linting |

---

## 3. Folder Structure

```
tripwiseui/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/
│   │   ├── client.js          # Axios instance + interceptors
│   │   └── index.js           # All API endpoint functions
│   ├── assets/
│   │   └── hero.png
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.jsx  # App shell (sidebar + mobile header)
│   │   └── ui/
│   │       └── index.jsx      # All shared UI primitives
│   ├── context/
│   │   └── AuthContext.jsx    # Auth state + login/register/logout
│   ├── hooks/                 # (empty — for future custom hooks)
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ForgotPasswordPage.jsx
│   │   ├── trips/
│   │   │   ├── TripsPage.jsx        # Trip list + create trip
│   │   │   ├── TripLayout.jsx       # Trip shell + tab nav
│   │   │   ├── TripDashboard.jsx    # Trip overview stats
│   │   │   ├── BudgetPage.jsx       # Budget plan + category bars
│   │   │   ├── ExpensesPage.jsx     # Expense list + CRUD
│   │   │   ├── MembersPage.jsx      # Members + invite
│   │   │   ├── SettlementsPage.jsx  # Settlements + balances
│   │   │   ├── WalletPage.jsx       # Wallet contributions + txns
│   │   │   └── AnalyticsPage.jsx    # Charts & analytics
│   │   ├── admin/
│   │   │   └── AdminPage.jsx        # Admin panel (users/trips/audit)
│   │   ├── NotificationsPage.jsx    # Notification list
│   │   └── ProfilePage.jsx          # User profile + edit
│   ├── utils/                 # (empty — for future utilities)
│   ├── App.jsx                # Route definitions
│   ├── App.css                # Minimal (Tailwind handles styles)
│   ├── index.css              # Tailwind base import
│   └── main.jsx               # Entry point — BrowserRouter + AuthProvider
├── index.html
├── package.json
└── vite.config.js
```

---

## 4. Routing Architecture

### Entry Point — `main.jsx`
Wraps the app with:
- `<BrowserRouter>` — client-side routing
- `<AuthProvider>` — global auth state

### Route Guards — `App.jsx`

| Guard | Logic |
|---|---|
| `<PrivateRoute>` | Redirects to `/login` if not authenticated |
| `<PublicRoute>` | Redirects to `/` if already authenticated |
| `<AdminRoute>` | Redirects to `/` if user role is not `Admin` |

### Full Route Tree

```
/login                          → LoginPage           [PublicRoute]
/register                       → RegisterPage         [PublicRoute]
/forgot-password                → ForgotPasswordPage   [PublicRoute]

/                               → TripsPage            [PrivateRoute > AppLayout]
/notifications                  → NotificationsPage    [PrivateRoute > AppLayout]
/profile                        → ProfilePage          [PrivateRoute > AppLayout]
/admin                          → AdminPage            [PrivateRoute > AdminRoute > AppLayout]

/trips/:tripId                  → TripLayout           [PrivateRoute > AppLayout]
/trips/:tripId                  → TripDashboard        (index)
/trips/:tripId/budget           → BudgetPage
/trips/:tripId/expenses         → ExpensesPage
/trips/:tripId/members          → MembersPage
/trips/:tripId/settlements      → SettlementsPage
/trips/:tripId/wallet           → WalletPage
/trips/:tripId/analytics        → AnalyticsPage

*                               → redirect to /
```

---

## 5. API Layer

### `src/api/client.js`
- Creates an `axios` instance with `baseURL` from `VITE_API_URL` env var (default: `http://localhost:5000/api`)
- **Request interceptor:** Attaches `Authorization: Bearer <token>` from `localStorage`
- **Response interceptor:** On `401`, clears token/user from `localStorage` and redirects to `/login`

### `src/api/index.js` — Endpoint Groups

#### `authApi`
| Function | Method | Endpoint |
|---|---|---|
| `register(data)` | POST | `/auth/register` |
| `login(data)` | POST | `/auth/login` |
| `forgotPassword(email)` | POST | `/auth/forgot-password` |
| `resetPassword(data)` | POST | `/auth/reset-password` |

#### `userApi`
| Function | Method | Endpoint |
|---|---|---|
| `getProfile(userId)` | GET | `/users/:userId` |
| `updateProfile(userId, data)` | PUT | `/users/:userId` |

#### `tripApi`
| Function | Method | Endpoint |
|---|---|---|
| `create(data)` | POST | `/trips` |
| `getAll()` | GET | `/trips` |
| `getById(id)` | GET | `/trips/:id` |
| `update(id, data)` | PUT | `/trips/:id` |
| `delete(id)` | DELETE | `/trips/:id` |
| `getDashboard(id)` | GET | `/trips/:id/dashboard` |

#### `budgetApi`
| Function | Method | Endpoint |
|---|---|---|
| `create(tripId, data)` | POST | `/trips/:tripId/budget` |
| `get(tripId)` | GET | `/trips/:tripId/budget` |
| `getSummary(tripId)` | GET | `/trips/:tripId/budget/summary` |

#### `expenseApi`
| Function | Method | Endpoint |
|---|---|---|
| `create(tripId, data)` | POST | `/trips/:tripId/expenses` |
| `getAll(tripId, params)` | GET | `/trips/:tripId/expenses` |
| `getById(tripId, expenseId)` | GET | `/trips/:tripId/expenses/:expenseId` |
| `update(tripId, expenseId, data)` | PUT | `/trips/:tripId/expenses/:expenseId` |
| `delete(tripId, expenseId)` | DELETE | `/trips/:tripId/expenses/:expenseId` |
| `uploadAttachment(tripId, expenseId, formData)` | POST | `/trips/:tripId/expenses/:expenseId/attachment` |

#### `memberApi`
| Function | Method | Endpoint |
|---|---|---|
| `invite(tripId, data)` | POST | `/trips/:tripId/members/invite` |
| `join(tripId, token)` | POST | `/trips/:tripId/members/join` |
| `getAll(tripId)` | GET | `/trips/:tripId/members` |
| `remove(tripId, userId)` | DELETE | `/trips/:tripId/members/:userId` |
| `getInviteLink(tripId)` | GET | `/trips/:tripId/invite-link` |

#### `splitApi`
| Function | Method | Endpoint |
|---|---|---|
| `create(expenseId, data)` | POST | `/expenses/:expenseId/split` |
| `get(expenseId)` | GET | `/expenses/:expenseId/split` |
| `update(expenseId, data)` | PUT | `/expenses/:expenseId/split` |

#### `settlementApi`
| Function | Method | Endpoint |
|---|---|---|
| `getAll(tripId)` | GET | `/trips/:tripId/settlements` |
| `getMy(tripId)` | GET | `/trips/:tripId/settlements/my` |
| `pay(tripId, settlementId, data)` | POST | `/trips/:tripId/settlements/:settlementId/pay` |
| `getHistory(tripId)` | GET | `/trips/:tripId/settlements/history` |
| `getMemberBalance(tripId)` | GET | `/trips/:tripId/settlements/member-balance` |

#### `walletApi`
| Function | Method | Endpoint |
|---|---|---|
| `contribute(tripId, data)` | POST | `/trips/:tripId/wallet/contribute` |
| `get(tripId)` | GET | `/trips/:tripId/wallet` |
| `getTransactions(tripId)` | GET | `/trips/:tripId/wallet/transactions` |

#### `analyticsApi`
| Function | Method | Endpoint |
|---|---|---|
| `getSummary(tripId)` | GET | `/trips/:tripId/analytics/summary` |
| `getCategoryBreakdown(tripId)` | GET | `/trips/:tripId/analytics/category-breakdown` |
| `getBudgetVsActual(tripId)` | GET | `/trips/:tripId/analytics/budget-vs-actual` |
| `getMemberContributions(tripId)` | GET | `/trips/:tripId/analytics/member-contributions` |
| `getSpendingTrend(tripId)` | GET | `/trips/:tripId/analytics/spending-trend` |

#### `notificationApi`
| Function | Method | Endpoint |
|---|---|---|
| `getAll(params)` | GET | `/notifications` |
| `markRead(id)` | PUT | `/notifications/:id/read` |
| `markAllRead()` | PUT | `/notifications/read-all` |

#### `adminApi`
| Function | Method | Endpoint |
|---|---|---|
| `getDashboard()` | GET | `/admin/dashboard` |
| `getUsers(params)` | GET | `/admin/users` |
| `deactivateUser(userId)` | PUT | `/admin/users/:userId/deactivate` |
| `getTrips(params)` | GET | `/admin/trips` |
| `getAuditLogs(params)` | GET | `/admin/audit-logs` |

---

## 6. Auth Context

**File:** `src/context/AuthContext.jsx`

### State
| State | Type | Source |
|---|---|---|
| `user` | `{ userId, role }` or `null` | `localStorage.user` (JSON) |
| `token` | `string` or `null` | `localStorage.token` |

### Exposed via `useAuth()`
| Value/Function | Description |
|---|---|
| `user` | Current user object `{ userId, role }` |
| `token` | JWT token string |
| `isAuthenticated` | Boolean — `!!token` |
| `login(credentials)` | Calls `/auth/login`, persists token + user to localStorage |
| `register(data)` | Calls `/auth/register`, persists token + user |
| `logout()` | Clears localStorage, resets state |

---

## 7. Shared UI Components

**File:** `src/components/ui/index.jsx`

All components are Tailwind-styled, mobile-friendly, and accessible.

### `<Button>`
Props: `variant`, `size`, `loading`, `className`, + all native button props

| Variant | Appearance |
|---|---|
| `primary` (default) | Indigo filled |
| `secondary` | White with gray border |
| `danger` | Red filled |
| `ghost` | Transparent with hover bg |
| `success` | Emerald filled |

Sizes: `sm`, `md` (default), `lg`  
Loading state: shows spinner, disables button.

---

### `<Input>`
Props: `label`, `error`, `className`, + all native input props  
- Shows label above, error message below in red
- Red border on error, indigo focus ring

### `<Select>`
Props: `label`, `error`, `children`, + all native select props  
- Same visual pattern as Input

### `<Card>`
Props: `className`, + any div props  
- White background, `rounded-2xl`, subtle border + shadow

### `<Badge>`
Props: `color`, `children`  
Colors: `gray`, `green`, `red`, `blue`, `yellow`, `purple`, `indigo`  
- Pill-shaped label, small font

### `<Spinner>`
Props: `className` (default `w-8 h-8`)  
- Animated spinning ring in indigo

### `<EmptyState>`
Props: `icon`, `title`, `description`, `action`  
- Centered layout with icon block, heading, body text, optional CTA button

### `<Modal>`
Props: `open`, `onClose`, `title`, `children`  
- Fixed overlay with backdrop blur
- Bottom sheet on mobile (`items-end`), centered on desktop (`sm:items-center`)
- Scrollable content area, max 90vh height

### `<StatCard>`
Props: `label`, `value`, `icon`, `color`, `sub`  
Colors: `indigo`, `green`, `red`, `amber`, `purple`  
- Card with colored icon box on left, label + value + optional sub-text on right

---

## 8. Layout

**File:** `src/components/layout/AppLayout.jsx`

Used as the parent route element for all authenticated pages via `<Outlet />`.

### Desktop (≥ lg)
- Fixed left sidebar, 256px wide
- Logo area at top with TripWise branding
- Nav items with active highlight
- Admin Panel link visible only for `role === 'Admin'`
- User role label + Logout button at bottom

### Mobile (< lg)
- Top header bar with hamburger menu, centered logo, notification bell
- Slide-in drawer sidebar with black overlay backdrop
- Tap outside overlay to close

### Nav Items
| Route | Icon | Label |
|---|---|---|
| `/` | LayoutDashboard | My Trips |
| `/notifications` | Bell | Notifications |
| `/profile` | User | Profile |
| `/admin` | Shield | Admin Panel (Admin only) |

---

## 9. Pages — Auth

### `LoginPage` — `/login`
- Email + Password form via `react-hook-form`
- Calls `useAuth().login()`
- Error message display
- Links to `/register` and `/forgot-password`
- Full-screen gradient background (`indigo-50 → white → blue-50`)

### `RegisterPage` — `/register`
- Full Name, Email, Phone Number, Password fields
- Calls `useAuth().register()`
- Links to `/login`

### `ForgotPasswordPage` — `/forgot-password`
- Email input, calls `authApi.forgotPassword()`
- Shows success state ("Check your email") after submission
- Back to login link

---

## 10. Pages — Trips

### `TripsPage` — `/`
- Fetches all trips via `tripApi.getAll()`
- Filter tabs: All / Active / Completed / Cancelled
- Grid of `TripCard` components (2 columns on sm+)
- **Create Trip modal** with fields:
  - Trip Name, Destination
  - Start Date, End Date (date pickers)
  - Trip Type (Solo / Group / Family)
  - Description (optional)
- Empty state with CTA when no trips

---

### `TripLayout` — `/trips/:tripId`
- Fetches trip by ID, provides `{ trip, setTrip }` via `useOutletContext()`
- **Trip header:** name, status badge, type badge, destination, date range
- **Tab navigation** (horizontal scroll on mobile):

| Tab | Route |
|---|---|
| Dashboard | `/trips/:tripId` |
| Budget | `/trips/:tripId/budget` |
| Expenses | `/trips/:tripId/expenses` |
| Members | `/trips/:tripId/members` |
| Settlements | `/trips/:tripId/settlements` |
| Wallet | `/trips/:tripId/wallet` |
| Analytics | `/trips/:tripId/analytics` |

---

### `TripDashboard` — `/trips/:tripId` (index)
- Calls `tripApi.getDashboard(tripId)`
- **4 stat cards:** Total Budget · Total Spent · Remaining · You Owe
- **Recent Expenses** list (description, category, date, amount)
- **Trip Description** card (if set)
- Currency formatted as `₹` (Indian Rupee)

---

### `BudgetPage` — `/trips/:tripId/budget`
- Calls `budgetApi.get()` + `budgetApi.getSummary()`
- **2 stat cards:** Total Budget · Total Planned
- **Category progress bars:** planned vs actual per category
  - Red bar + "Over by ₹X" when actual exceeds planned
- **Set/Edit Budget modal:**
  - Total Budget input
  - Per-category allocation inputs (7 categories)
  - Filters out empty categories before saving

**Categories:** Travel · Accommodation · Food · Shopping · Fuel · Emergency · Miscellaneous

---

### `ExpensesPage` — `/trips/:tripId/expenses`
- Fetches expenses with optional category filter
- Shows total of all filtered expenses
- **Category filter chips** (scrollable horizontal row)
- **Expense card:** description, category badge, date, payer, amount, edit/delete actions
- **Add/Edit Expense modal:**
  - Description, Amount, Date, Category (select), Paid By (User ID)
  - Edit pre-fills form via `reset(editing)`

---

### `MembersPage` — `/trips/:tripId/members`
- Lists all trip members with avatar initials, name, join date, role badge
- Admin member cannot be removed
- **Invite Member modal:** invite by email OR phone number
- **Invite Link button:** fetches tokenized invite URL, shows copy-to-clipboard UI with `✓` feedback

---

### `SettlementsPage` — `/trips/:tripId/settlements`
- Calls `getAll()`, `getMy()`, and `getMemberBalance()` in parallel
- **3 tabs:**
  - **All** — list of all settlements with payer → receiver, amount, status, "Mark Paid" button
  - **My Dues** — personal payables (with Pay button) and receivables sections
  - **Balances** — per-member net balance card with total paid + fair share breakdown
- **2 stat cards:** You Owe · You Receive

---

### `WalletPage` — `/trips/:tripId/wallet`
- Calls `walletApi.get()` + `walletApi.getTransactions()`
- **3 stat cards:** Total Balance · Spent · Remaining
- **Contributions list:** contributor name, note, date, amount in emerald
- **Transaction history:** description, date, amount (green for positive, red for negative)
- **Contribute modal:** Amount, User ID, Note fields

---

### `AnalyticsPage` — `/trips/:tripId/analytics`
- Fetches all 5 analytics endpoints in parallel via `Promise.all()`
- **4 stat cards:** Total Budget · Total Expense · Remaining · Members count + top category
- **Daily Spending Trend** — `LineChart` (Recharts), X axis = date, Y axis = ₹ amount
- **Budget vs Actual** — `BarChart` with two bars per category (planned = light indigo, actual = indigo)
- **Expense by Category** — `PieChart` with percentage labels
- **Member Contributions** — horizontal progress bars with color per member, % share

Chart colors: `#6366f1` · `#f59e0b` · `#10b981` · `#ef4444` · `#8b5cf6` · `#3b82f6` · `#f97316`

---

## 11. Pages — General

### `NotificationsPage` — `/notifications`
- Fetches notifications via `notificationApi.getAll()`
- Unread count shown in header
- **Mark all read** button (visible only when unread > 0)
- Click any unread notification → calls `notificationApi.markRead(id)`
- Unread notifications have indigo-tinted background + blue dot indicator
- Timestamps shown as relative time (e.g., "5m ago", "2h ago", "3d ago")
- Empty state when no notifications

---

### `ProfilePage` — `/profile`
- Fetches user profile via `userApi.getProfile(userId)` from `useAuth().user.userId`
- **Avatar card:** initials from `fullName`, role badge with shield icon
- **Edit form:** Full Name, Email, Phone Number via `react-hook-form`
- Success ("Profile updated!") and error feedback banners
- **Sign Out button** in danger zone section (calls `logout()` + redirects to `/login`)

---

## 12. Pages — Admin

### `AdminPage` — `/admin` (Admin role only)

**4 tabs:**

#### Overview
- Stat cards: Total Users · Active Trips · Total Trips · Total Expenses
- Recent Activity list (action, user ID, timestamp)

#### Users
- Card per user: avatar initials, full name, email
- Active/Inactive badge, Role badge
- **Deactivate button** (UserX icon) for non-admin active users → calls `adminApi.deactivateUser()`

#### Trips
- Card per trip: name, destination, date range, owner, status badge

#### Audit Logs
- Card per log entry: action, user ID, entity type + ID, timestamp

---

## 13. Styling & Design System

### Color Palette
| Usage | Color |
|---|---|
| Primary / Brand | Indigo 600 (`#4f46e5`) |
| Success | Emerald 600 (`#059669`) |
| Danger | Red 500/600 |
| Warning / Money | Amber 500 |
| Background | Gray 50 |
| Card surfaces | White |
| Text primary | Gray 900 |
| Text secondary | Gray 500 |
| Borders | Gray 100/200 |

### Design Principles
- **Mobile-first:** all layouts stack vertically, horizontal scroll used for tab navs and filter chips
- **Rounded corners:** `rounded-xl` for inputs/buttons, `rounded-2xl` for cards/modals
- **Consistent spacing:** `p-4 sm:p-6` for page padding, `gap-3` / `gap-4` for grids
- **No hardcoded heights** on content areas — scrollable containers
- **Touch targets:** minimum `40px` height on all interactive elements
- **Transitions:** `transition-all` on all interactive elements for smooth hover/active states
- **Shadows:** `shadow-sm` on cards, `shadow-xl` on modals

### Responsive Breakpoints
| Breakpoint | Behavior |
|---|---|
| Default (mobile) | Single column, bottom-sheet modals, hamburger sidebar |
| `sm` (640px+) | 2-column grids, centered modals |
| `lg` (1024px+) | Fixed sidebar visible, 4-column stat grids |

---

## 14. What's Done vs What's Pending

### ✅ Completed

| Feature | Files |
|---|---|
| Project setup (Vite + React + Tailwind) | `vite.config.js`, `package.json`, `index.css` |
| Axios client + interceptors | `api/client.js` |
| All API endpoint functions | `api/index.js` |
| JWT auth context (login/register/logout) | `context/AuthContext.jsx` |
| Shared UI component library | `components/ui/index.jsx` |
| App shell with responsive sidebar | `components/layout/AppLayout.jsx` |
| Full route tree with guards | `App.jsx`, `main.jsx` |
| Login page | `pages/auth/LoginPage.jsx` |
| Register page | `pages/auth/RegisterPage.jsx` |
| Forgot password page | `pages/auth/ForgotPasswordPage.jsx` |
| Trips list + create trip | `pages/trips/TripsPage.jsx` |
| Trip shell + tab navigation | `pages/trips/TripLayout.jsx` |
| Trip dashboard (stats + recent expenses) | `pages/trips/TripDashboard.jsx` |
| Budget plan + category progress | `pages/trips/BudgetPage.jsx` |
| Expenses CRUD + category filter | `pages/trips/ExpensesPage.jsx` |
| Members + invite + invite link | `pages/trips/MembersPage.jsx` |
| Settlements (all / my dues / balances) | `pages/trips/SettlementsPage.jsx` |
| Wallet (contributions + transactions) | `pages/trips/WalletPage.jsx` |
| Analytics (4 charts + stats) | `pages/trips/AnalyticsPage.jsx` |
| Notifications (list + mark read) | `pages/NotificationsPage.jsx` |
| Profile (view + edit + logout) | `pages/ProfilePage.jsx` |
| Admin panel (users, trips, audit logs) | `pages/admin/AdminPage.jsx` |

---

### 🔲 Pending / Not Yet Implemented

| Feature | Notes |
|---|---|
| Reset Password page | `authApi.resetPassword()` is wired, but no `/reset-password` route/page |
| Join Trip via invite token | `memberApi.join()` exists, no `/join` route created |
| Expense split UI | `splitApi` is fully wired; no UI to create/view splits on an expense |
| Expense attachment upload | `expenseApi.uploadAttachment()` exists, no file input in expense form |
| Trip edit / delete | `tripApi.update()` and `tripApi.delete()` exist, not exposed in UI |
| Notification badge count | Bell icon in sidebar/header has no unread count badge |
| Profile avatar upload | No image upload — initials-only avatar |
| Pagination | API supports `params` for pagination; UI loads all records |
| Global error boundary | No React error boundary around the app |
| Loading skeletons | Uses spinners; could be replaced with skeleton screens |
| Toast notifications | No toast system — errors/success shown inline only |
| Environment config | `.env` file not created; relies on default `localhost:5000` |

---

## Environment Setup

Create a `.env` file in the `tripwiseui/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Project

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```
