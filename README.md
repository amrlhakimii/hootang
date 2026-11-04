# Hootang

Hootang is a personal money-tracking web app (React single-page app with Firebase backend) for tracking loans owed between friends, recurring bills and subscriptions, spending, and splitting receipts. Amounts are in Malaysian context (DuitNow payment details, due-date reminders scheduled on Malaysia time).

## Features

Verified from the routes and feature folders in `src/`:

- Dashboard, transaction history, and spending tracking with budgets
- Loans, bills, and subscriptions (including payment history)
- Friends list
- Receipt splitting: items, tax/service charge/discount, percentage split, per-person assignment, DuitNow settings, PDF receipt generation, and sharing via WhatsApp
- Optional receipt scanning from a photo, using an OpenRouter model (`src/utils/scanReceipt.ts`)
- Dice roller and random picker
- Authentication via Firebase Auth
- Push notifications for items due in 3 days: a Firebase scheduled function (`functions/`) and an alternative Cloudflare Worker on a daily cron (`cloudflare-worker/`)

## Tech stack

- React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7
- Firebase (Auth, Firestore, Cloud Messaging, Cloud Functions)
- Cloudflare Workers (scheduled notifications)
- jsPDF, qrcode, jsQR, canvas-confetti, GSAP, anime.js, lucide-react
- Deployed with Netlify (`netlify.toml`) and Firebase configs

## Running locally

```bash
yarn install        # or npm install
cp .env.example .env
yarn dev
yarn build          # tsc -b && vite build
yarn lint
```

Environment variables (names only; see `.env.example`):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_VAPID_KEY`
- `VITE_OPENROUTER_API_KEY` (only needed for receipt scanning; note that `VITE_` variables are embedded in the client bundle)

The Cloudflare Worker expects `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` as Worker secrets.

## Project structure

```
src/
  features/   auth, bills, dashboard, dice, friends, history, loans, receipt, spending, subscriptions
  components/ layout/ (generic UI) and ui/ (navigation, branding)
  context/    Auth and Toast providers
  routes/     route definitions
  utils/      split calculation, DuitNow, PDF generation, receipt scanning
  types/      shared TypeScript types
functions/          Firebase scheduled function (due-date notifications)
cloudflare-worker/  Cloudflare Worker with daily cron (due-date notifications)
firestore.rules     Firestore security rules
```
