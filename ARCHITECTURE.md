# PromoGames — Architecture & Project Structure

## Overview

PromoGames is a gamified marketing platform (quiz, crossword, spin wheel, and 30+ mini-games) built as an **npm workspaces monorepo**.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | Node.js, Express, **MySQL** (mysql2) |
| Frontend    | React, Vite, TypeScript, Tailwind CSS |
| Mobile      | Flutter (Dart)                      |
| Monorepo    | npm workspaces                      |
| Auth        | JWT + bcrypt                        |
| Email       | Nodemailer (SMTP)                   |

## Directory Structure

```
promogames/
├── apps/
│   ├── backend/          # Express API server (MySQL)
│   │   ├── server.js     # Entry point — 340 lines, ~80 route mounts
│   │   ├── config/
│   │   │   ├── db.js     # MySQL connection pool (mysql2)
│   │   │   ├── env.js    # Env var validation (exits if required vars missing)
│   │   │   ├── initDB.js # Schema + migrations (~135KB)
│   │   │   ├── initPromo.js
│   │   │   ├── initSpin.js
│   │   │   └── upload.js # Multer config
│   │   ├── routes/       # ~80 route files (auth, games, quiz, spin, etc.)
│   │   ├── middleware/   # auth, requireAdmin
│   │   ├── lib/          # apiError, geocode
│   │   ├── cron/         # pcReset cron job
│   │   ├── uploads/      # Uploaded files
│   │   └── package.json
│   └── frontend/         # React SPA (Vite + TypeScript + Tailwind)
├── packages/
│   ├── api-client/       # Shared axios-based API client
│   └── ui/               # Shared React component library
├── features/             # Feature modules (auth, quiz, crossword, spin, etc.)
├── mobile/               # Flutter app
├── load-test.js          # Load testing script
├── quick-load-test.js    # Quick load test
└── package.json          # Root — workspaces: apps/*, packages/*, features/*
```

## Backend Architecture

### Database
- **MySQL** (not MongoDB) via `mysql2` package
- Connection pool in `config/db.js` with `pool.promise()` for async/await
- Schema/migrations in `config/initDB.js` (runs on every startup, idempotent)
- Raw SQL queries throughout (no ORM)

### Server (`server.js`)
1. **CORS** — Configurable allowed origins, credentials enabled
2. **Security headers** — nosniff, X-Frame-Options, CSP, etc.
3. **Rate limiting** — In-memory (login: 10 req/15min per IP)
4. **Routes** — ~80 routes mounted under `/api/*`
   - Admin-only routes use `requireAdmin` middleware
   - Player/public routes: `/api/play`, `/api/leaderboard`, `/api/auth`
5. **Static serving** — Serves frontend `dist/` in production
6. **Social sharing** — Dynamic OG tags for social media crawlers
7. **Error handling** — Global handler, no stack trace leaks

### Route Categories
- **Admin**: games, templates, quiz, spin, crossword, clients, upload, sounds, players-admin
- **Public**: auth, play, leaderboard
- **Game routes** (~30+): snake, tetris, 2048, sudoku, chess, ludo, carrom, tictactoe, whackamole, bubble shooter, etc.

## Frontend Architecture
- React + Vite + TypeScript + Tailwind CSS
- React Router v6 for routing
- Axios-based API client (shared in `packages/api-client`)
- Shared UI components in `packages/ui`

## Mobile
- Flutter app in `mobile/`
- Communicates with backend via HTTP API

## Environment Variables
See `apps/backend/.env.example` for all required and optional variables.
Required: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, SMTP_*
