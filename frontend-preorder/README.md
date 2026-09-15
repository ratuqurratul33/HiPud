# Hipud Frontend 🍡

The customer-facing and admin web app for Hipud's pre-order platform.

## Features

- Menu catalog with cart and quick pre-order
- DP checkout flow with WhatsApp confirmation
- Live schedule/batch display
- Review submission with invoice verification
- FAQ and order-flow guide sections

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- SweetAlert2, Lucide Icons

## Project Purpose

A single-page application built around component-based architecture and client-side routing, consuming the backend's REST API via Axios. Styling is utility-first with Tailwind for a fast, consistent, mobile-first UI.

## Notes

- Requires an `.env` with the backend API base URL.
- `dist` and `node_modules` are gitignored.

## Preview

Live: [hipud-profile.vercel.app](https://hipud-profile.vercel.app/)

## How to Build

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build
```
