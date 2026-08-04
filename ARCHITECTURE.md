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
- Player-engagement schema (from `config/initPromo.js`, run manually):
  - `games.high_score` — all-time high score per game
  - `player_best_scores` — per-player (or per-`device_id` guest) best score, `UNIQUE(player_id, game_id)` + `UNIQUE(device_id, game_id)`, upserted with `GREATEST`
  - `player_sessions.device_id` — guest identity for play tracking & best scores
  - `pc_transactions` index `(player_id, type, created_at)` — powers the monthly leaderboard

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

### Player Engagement API (`apps/backend/routes/player.js`)
- `POST /api/play/session/start` — accepts `device_id` for guest identity; response includes `game_type` so the frontend can skip registration for promogames
- `POST /api/play/session/complete` — marks the session complete and, when `score > 0`, upserts `player_best_scores` (GREATEST) and updates `games.high_score`
- `GET /api/play/play-page-games` — returns `{ games, featured (branded), promogames }` for the arcade; split by `game_type`
- `GET /api/play/game/:id/score-info` — `{ high_score, player_best }`; `player_best` resolved via `Bearer` token or `?device_id=`, `null` where unused
- `GET /api/play/leaderboard` — monthly rank by PC **earned** this month (`type='earn'`, spends ignored); sequential `ROW_NUMBER` ties (#53, #54); optional `Bearer` adds your own rank; board restarts each month via the existing `pcReset` cron
- `GET /api/play/game/:id/play-count` — lightweight completed-play counter

## Frontend Architecture
- React + Vite + TypeScript + Tailwind CSS
- React Router v6 for routing
- Axios-based API client (shared in `packages/api-client`)
- Shared UI components in `packages/ui`

### Arcade / Play page (`src/pages/ArcadePage.jsx`)
- **Rows**: Featured (branded games, horizontal scroll track) + PromoGames (masonry)
- **PromoGames masonry**: CSS `columns` grid — 8 columns desktop, 6 tablet, 5 phone; each card gets a fixed column width and an auto height driven by its aspect ratio
- **Random ratios**: each card randomly picks one of `1:1, 3:4, 4:3, 16:9, 9:16` (keys `11, 34, 43, 169, 916`). `pickGameRatio()` probes which icon files actually exist (HEAD + `Content-Type: image/` — required because Vite returns the HTML SPA fallback with HTTP 200 for missing files) and picks randomly **only among available ratios**
- **Icon sources** (checked in order): `public/game-previews/<category>/<category><key>.png`, `game-previews/<category>/<category>_<key>.png`, `public/gameicons/<slug>/<slug>_<key>.png`, then `game_logo_url`/`bg_image_url`, then an emoji placeholder. Add icons as `public/game-previews/snake/snake11.png` etc. (category-key naming, no underscore)
- **Play tracking**: modal close triggers `loadGames()` to refresh play counts; `PlayerPage.jsx` auto-completes promogames sessions on exit via `navigator.sendBeacon` (no score — marks the play, high scores only come from games that report a score), and sends a persistent `device_id` (localStorage + `crypto.randomUUID`) with every session start so guest best scores persist across devices

## Mobile
- Flutter app in `mobile/`
- Communicates with backend via HTTP API

## Environment Variables
See `apps/backend/.env.example` for all required and optional variables.
Required: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, SMTP_*
