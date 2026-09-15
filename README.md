# Hipud Website 🍡

A pre-order platform for Hipud, a homemade mochi business — from browsing the menu to DP payment and order tracking.

## Features

- Online pre-order with cart and DP (down payment) checkout
- Batch/schedule system for online, stand, and danus orders
- Customer review system with admin moderation
- Admin dashboard for managing products, orders, and payments
- Fully responsive, mobile-first UI

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Deployment:** Vercel (frontend & backend as separate projects)

## Project Purpose

This repo is a monorepo separating a client SPA from a REST API backend, connected purely through HTTP. It focuses on a real-world pre-order workflow: batch-based production scheduling, DP payment verification, and role-based admin access — built with a typed full-stack (TypeScript end to end).

## Notes

- `frontend-preorder` and `backend-preorder` are deployed as separate Vercel projects, each with its own Root Directory setting.
- Secrets (`.env`), `node_modules`, `dist`, and runtime uploads are excluded from the repo.

## Preview

Live site: [hipud-profile.vercel.app](https://hipud-profile.vercel.app/)

## How to Build

**Backend**

```bash
cd backend-preorder
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Frontend**

```bash
cd frontend-preorder
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000` (or your deployed API URL).
