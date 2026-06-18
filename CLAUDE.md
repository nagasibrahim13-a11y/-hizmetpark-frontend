# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HizmetPark is a two-sided marketplace for local service bookings (barber, hair salon, beauty, futsal). It has two separate repos on disk:

| Repo | Path | Stack |
|------|------|-------|
| Frontend | `C:\Users\ibrah\hizmetpark-frontend` | React 19, Create React App, plain CSS |
| Backend | `C:\Users\ibrah\hizmetpark` | Node.js, Express 5, Mongoose, MongoDB Atlas |

## Commands

### Frontend (`C:\Users\ibrah\hizmetpark-frontend`)
```
npm start        # dev server → http://localhost:3000
npm run build    # production build
npm test         # Jest (watch mode)
```

### Backend (`C:\Users\ibrah\hizmetpark`)
```
node server.js   # starts API on http://localhost:5000
```
No nodemon is configured — restart manually after backend changes.

## Architecture

### No Router Library
Navigation is handled entirely through a `sayfa` state variable in `App.js`. `AppRouter` renders the correct page component based on `sayfa`. There is no React Router.

### Auth Flow
`AuthContext` (`src/context/AuthContext.js`) is the single source of truth for the logged-in user. Key pattern: `girisGerektir(callback)` stores a pending action in a `useRef` (not state, to avoid stale closures), opens the login modal, then executes the callback after successful login, passing the freshly logged-in user object.

User object shape returned by the API and stored in context:
```js
{ id, ad, email, rol }   // rol: 'musteri' | 'isletme'
```

After login, routing depends on role: `isletme` role → `isletmePanel`; `musteri` role stays on `anaSayfa`.

### Two User Roles
- **müşteri** — browses businesses, books appointments, earns loyalty points
- **işletme** — manages their business profile, working hours, closed dates, services, and appointments via `IsletmePanel`

### API Base URL
All frontend fetches hardcode `http://localhost:5000`. There is no environment variable for this.

### Backend API Routes
| Prefix | File | Purpose |
|--------|------|---------|
| `/api/auth` | `routes/auth.js` | Google OAuth login (verifies Google ID token, upserts user) |
| `/api/kullanicilar` | `routes/kullanicilar.js` | Email/password register & login (plaintext password — no hashing) |
| `/api/isletmeler` | `routes/isletmeler.js` | Business CRUD, listing, search |
| `/api/randevular` | `routes/randevular.js` | Appointment booking, status updates, loyalty trigger |
| `/api/sadakat` | `routes/sadakat.js` | Loyalty card read/update, reward redemption |
| `/api/yorumlar` | `routes/yorumlar.js` | Reviews |
| `/api/reklamlar` | `routes/reklamlar.js` | Ads/sponsored listings |

### Loyalty System
When an appointment is marked `tamamlandi`, the backend automatically upserts a `Sadakat` document (musteri+isletme pair) and increments `mevcutPuan`. When `mevcutPuan >= odul.hedefZiyaret`, a reward entry is pushed to `kazanilanOduller` and `mevcutPuan` resets to 0. A reward can be redeemed as a `hediyeMi: true` appointment, which marks the reward `kullanildi: true`.

### Closed Date Guard
Before creating an appointment, `routes/randevular.js` fetches the business and checks `kapaliTarihler`. A date can be blocked for the full day (`tumGun: true`) or for specific time slots (`saatler: [...]`).

### Backend Environment
`C:\Users\ibrah\hizmetpark\.env` must contain:
```
MONGODB_URI=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```
`dotenv` is loaded only in `db.js`. `server.js` itself does not call `dotenv.config()`, so `auth.js` reads `process.env.GOOGLE_CLIENT_ID` which is populated because `db.js` (required by `server.js`) loads dotenv first.
