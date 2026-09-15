# Hipud Backend 🍡

REST API powering the Hipud pre-order platform — products, orders, payments, and reviews.

## Features

- JWT-based admin authentication
- Product/menu CRUD management
- Order & DP payment handling
- Image upload via Cloudinary
- PDF invoice generation
- Scheduled cleanup jobs (cron)
- Review moderation

## Tech Stack

- Node.js + Express 5
- TypeScript
- Prisma ORM + PostgreSQL
- JWT, bcryptjs
- Multer + Cloudinary
- node-cron, PDFKit

## Project Purpose

A stateless REST API following a controller/route/service structure, with Prisma as the database abstraction layer and JWT for admin session security. Deployed as serverless functions on Vercel, with cron-based cleanup for stale/unpaid orders.

## Notes

- Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`/`ADMIN_PASSWORD`, and Cloudinary credentials.
- `uploads/` is used only for local runtime files and is gitignored.

## Preview

Live API base: [hi-pud.vercel.app](https://hi-pud.vercel.app/)

## How to Build

```bash
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev      # local dev server
npm run build    # compile TypeScript
npm start         # run compiled build
```
