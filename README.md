# GhostKitchen

> **Multi-role food ordering platform** — GraphQL API, real-time kitchen updates via Socket.IO, OTP-based order lookup, and separate flows for admins, kitchens, and customers.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ghost--kitchen--frontend.vercel.app-f97316?style=flat)](https://ghost-kitchen-frontend.vercel.app)
![Tech](https://img.shields.io/badge/Stack-React%20%2B%20GraphQL%20%2B%20Socket.IO-3B82F6?style=flat)

---

## What it solves

Ghost kitchens (delivery-only restaurants) need to coordinate between customers placing orders, kitchen staff managing them, and admins controlling the platform — without a unified system. GhostKitchen gives each role exactly what they need, in real time, with no overlap.

---

## Architecture

```
┌──────────────────────────────────────────┐
│              React Frontend              │
│  Apollo Client (GraphQL) + Socket.IO     │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│           Express Backend                │
│                                          │
│  ┌─────────────┐   ┌──────────────────┐  │
│  │  GraphQL    │   │   REST (OTP)     │  │
│  │  /graphql   │   │  /api/otp/*      │  │
│  └──────┬──────┘   └────────┬─────────┘  │
│         │                   │            │
│  ┌──────▼───────────────────▼─────────┐  │
│  │           MongoDB (Mongoose)        │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌─────────────────────────────────┐     │
│  │  Socket.IO — Kitchen rooms      │     │
│  │  Scoped per kitchen · per order │     │
│  └─────────────────────────────────┘     │
└──────────────────────────────────────────┘
```

---

## Role Flows

### Customer
- Browses active restaurants and menus
- Places an order (no account required)
- Tracks order by ID
- Verifies phone via OTP to retrieve past orders (stateless, no account creation)

### Kitchen
- Signs up and logs in
- Manages their own restaurants and products
- Receives live order notifications via Socket.IO (scoped to their kitchen room)
- Updates order status and ETA — customer sees changes in real time
- Views full order history

### Admin
- Creates and manages kitchens, restaurants, cuisines
- Toggles kitchen availability
- Drills into kitchen and restaurant detail views

---

## API Surface

| Interface | Purpose |
|---|---|
| `POST /graphql` | All application data — queries and mutations |
| `POST /api/otp/send` | Send OTP to phone number |
| `POST /api/otp/verify` | Verify OTP and return order lookup token |
| `Socket.IO` | Real-time kitchen order events + order status updates |

---

## Key Features

- 📡 **GraphQL API** — single endpoint for all data operations (Apollo Client on the frontend)
- 🔴 **Real-time order flow** — Socket.IO rooms scoped per kitchen and per order
- 📱 **OTP phone verification** — stateless customer order lookup without an account system
- 🔐 **JWT auth** — role-based access for admin and kitchen; customers are unauthenticated
- 🍽️ **Kitchen self-signup** — kitchens onboard themselves; admin approves and manages
- ⚙️ **Custom order state machine** — status transitions (placed → confirmed → preparing → ready → delivered)
- 🧑‍💼 **Cuisine management** — admin creates and toggles cuisines that kitchens operate under

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · React Router 7 · Apollo Client · Tailwind CSS · Vite |
| Backend | Express 5 · express-graphql · Socket.IO · JWT · bcrypt |
| Database | MongoDB with Mongoose |
| Auth | JWT (admin/kitchen) · OTP + verificationToken (customers) |
| Deployment | Vercel (frontend) |

---

## Running Locally

```bash
# From repo root — installs all workspaces
npm install

# Start backend
cd apps/backend && npm run dev

# Start frontend
cd apps/frontend && npm run dev
```

**Local URLs:**
- Frontend: `http://localhost:5173`
- GraphQL endpoint: `http://localhost:4000/graphql`
- Backend health: `http://localhost:4000/health`

**Environment variables:**

`apps/backend/.env`
```
MONGO_URI=mongodb://localhost:27017/ghost-kitchen
JWT_SECRET=your-secret-here
PORT=4000
```

`apps/frontend/.env`
```
VITE_API_URL=http://localhost:4000/graphql
VITE_SOCKET_URL=http://localhost:4000
```

---

## Seed Admin

```bash
# Creates a default admin if one doesn't exist
npx ts-node apps/backend/src/seed/admin.ts
```

> ⚠️ Change the seeded credentials before any non-local usage.

---

## Project Structure

```
ghost-kitchen/
  apps/
    backend/    Express · GraphQL · Socket.IO · MongoDB models · OTP routes · JWT auth
    frontend/   React app for admin, kitchen, and customer flows
```