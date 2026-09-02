const express = require("express");
const cors = require("cors");
const compression = require("compression");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
require("./config/env"); // Validates all required env vars — exits if missing

const app = express();

// ── Layer 1+2: CORS lockdown + security headers ─────────────────────────────
// The frontend calls the API same-origin (baseURL '/api'), so we only allow
// known origins. Set ALLOWED_ORIGINS (comma-separated) in .env for production.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin, cb) => {
    // allow same-origin requests (origin undefined) and listed origins
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("CORS origin not allowed"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Security headers (defense-in-depth; a reverse proxy should also set these)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN"); // DENY would break our own GameModal iframe
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");
  // Ignored over plain HTTP, picked up automatically once HTTPS terminates here
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'"
  );
  next();
});

// ── Minimal in-memory rate limiter (no extra dependency) ────────────────────
function rateLimit({ windowMs = 60000, max = 100 } = {}) {
  const hits = new Map();
  setInterval(() => hits.clear(), windowMs).unref();
  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const count = (hits.get(key) || 0) + 1;
    hits.set(key, count);
    if (count > max) {
      return res.status(429).json({ success: false, message: "Too many requests, slow down." });
    }
    next();
  };
}
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }); // 10/15min per IP

// gzip/brotli compression for all responses — cuts transfer size for JS/CSS/JSON
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Optimized WebP serve-through for uploaded images ─────────────────────────
// config/upload.js generates a compressed .webp sibling for every png/jpg
// upload. When one exists, serve it transparently for the original URL —
// zero DB/frontend changes, big transfer savings.
const UPLOADS_DIR = path.join(__dirname, "uploads");
app.use("/uploads", (req, res, next) => {
  if (req.method === "GET" && /\.(png|jpe?g)$/i.test(req.path)) {
    try {
      const rel = decodeURIComponent(req.path).replace(/\.(png|jpe?g)$/i, ".webp");
      const webpPath = path.join(UPLOADS_DIR, rel);
      if (fs.existsSync(webpPath)) {
        res.setHeader("Content-Type", "image/webp");
        return res.sendFile(webpPath);
      }
    } catch { /* fall through to static */ }
  }
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  // Uploaded filenames are UUIDs → content is immutable → long cache is safe
  maxAge: "30d",
  immutable: true,
  // Prevent browsers from executing uploaded files; force download/sniff-safe
  setHeaders: (res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Disposition", "inline");
  },
}));

const authRoutes = require("./routes/auth");
const pauthRoutes = require("./routes/Pauth");
const gamesRoutes = require("./routes/games");
const templateRoutes = require("./routes/templates");
const soundsRoutes = require("./routes/sounds");
const uploadRoutes = require("./routes/upload");
const quizRoutes = require("./routes/quiz");
const playerRoutes = require("./routes/player");
const clientsRoutes = require("./routes/clients");
const spinRoutes = require("./routes/spin");
const crosswordRoutes = require("./routes/crossword");
const leaderboardRoutes = require("./routes/leaderboard");
const playersAdminRoutes = require("./routes/players-admin");
const memoryRoutes = require("./routes/memory");
const jigsawRoutes = require("./routes/jigsaw");
const wordsearchRoutes = require("./routes/wordsearch");
const pouringRoutes = require("./routes/pouring");
const typerRoutes = require("./routes/typer");
const screwRoutes = require("./routes/screw");
const towerRoutes = require("./routes/tower");
const snakeRoutes = require("./routes/snake");
const catchRoutes = require("./routes/catch");
const reactionRoutes = require("./routes/reaction");
const mathRoutes = require("./routes/math");
const mazeRoutes = require("./routes/maze");
const game2048Routes = require("./routes/2048");
const simonRoutes = require("./routes/simon");
const bounceRoutes = require("./routes/bounce");
const flappyRoutes = require("./routes/flappy");
const canvaRoutes = require("./routes/canva");
const connect4Routes = require("./routes/connect4");
const brickImagesRoutes = require("./routes/brickImages");
const bowlingRoutes = require("./routes/bowling");
const sudokuRoutes = require("./routes/sudoku");
const minesweeperRoutes = require("./routes/minesweeper");
const wordscrambleRoutes = require("./routes/wordscramble");
const rpsRoutes = require("./routes/rps");
const arrowescapeRoutes = require("./routes/arrowescape");
const spaceRoutes = require("./routes/space");
const bejeweledRoutes = require("./routes/bejeweled");
const candyblastRoutes = require("./routes/candyblast");
const tetrisRoutes = require("./routes/tetris");
const stackRoutes = require("./routes/stack");
const whackamoleRoutes = require("./routes/whackamole");
const hanoiRoutes = require("./routes/hanoi");
const breakoutRoutes = require("./routes/breakout");
const bubbleshooterRoutes = require("./routes/bubbleshooter");
const carlaunchRoutes = require("./routes/carlaunch");
const stressbusterRoutes = require("./routes/stressbuster");
const soundifyRoutes = require("./routes/soundify");
const tictactoeRoutes = require("./routes/tictactoe");
const chessRoutes = require("./routes/chess");
const snakeandladderRoutes = require("./routes/snakeandladder");
const ludoRoutes = require("./routes/ludo");
const CarromRoutes = require("./routes/Carrom");
const tictactoemultiRoutes = require("./routes/tictactoemulti");
const businessOwnerRoutes = require("./routes/businessOwner");
const businessDevRoutes = require("./routes/businessDev");
const franchiseRoutes = require("./routes/franchise");
const internalTeamRoutes = require("./routes/internalTeam");
const { itAuth } = internalTeamRoutes;
const auth = require("./middleware/auth");
const { requireAdmin } = require("./middleware/auth");
const notificationsRoutes = require("./routes/notifications");
const systemRoutes = require("./routes/system");
const translateRoutes = require("./routes/translate");
const { startCompanion, stopCompanion } = require("./libretranslateCompanion");

app.use("/api/auth", authRoutes);
app.use("/api/pauth", pauthRoutes);
app.use("/api/games", requireAdmin, gamesRoutes);
app.use("/api/templates", requireAdmin, templateRoutes);
app.use("/api/sounds", requireAdmin, soundsRoutes);
app.use("/api/upload", requireAdmin, uploadRoutes);
app.use("/api/quiz", requireAdmin, quizRoutes);
app.use("/api/play", playerRoutes);
app.use("/api/clients", requireAdmin, clientsRoutes);
app.use("/api/spin", requireAdmin, spinRoutes);
app.use("/api/crossword", requireAdmin, crosswordRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/players-admin", requireAdmin, playersAdminRoutes);
app.use("/api/memory", requireAdmin, memoryRoutes);
app.use("/api/jigsaw", requireAdmin, jigsawRoutes);
app.use("/api/wordsearch", requireAdmin, wordsearchRoutes);
app.use("/api/pouring", requireAdmin, pouringRoutes);
app.use("/api/typer", requireAdmin, typerRoutes);
app.use("/api/screw", requireAdmin, screwRoutes);
app.use("/api/tower", requireAdmin, towerRoutes);
app.use("/api/snake", requireAdmin, snakeRoutes);
app.use("/api/catch", requireAdmin, catchRoutes);
app.use("/api/reaction", requireAdmin, reactionRoutes);
app.use("/api/math", requireAdmin, mathRoutes);
app.use("/api/maze", requireAdmin, mazeRoutes);
app.use("/api/2048", game2048Routes);
app.use("/api/simon", requireAdmin, simonRoutes);
app.use("/api/bounce", requireAdmin, bounceRoutes);
app.use("/api/flappy", requireAdmin, flappyRoutes);
app.use("/api/canva", requireAdmin, canvaRoutes);
app.use("/api/connect4", connect4Routes);
app.use("/api/brick-images", requireAdmin, brickImagesRoutes);
app.use("/api/bowling", requireAdmin, bowlingRoutes);
app.use("/api/sudoku", requireAdmin, sudokuRoutes);
app.use("/api/minesweeper", requireAdmin, minesweeperRoutes);
app.use("/api/wordscramble", requireAdmin, wordscrambleRoutes);
app.use("/api/rps", requireAdmin, rpsRoutes);
app.use("/api/arrowescape", requireAdmin, arrowescapeRoutes);
app.use("/api/space", requireAdmin, spaceRoutes);
app.use("/api/bejeweled", requireAdmin, bejeweledRoutes);
app.use("/api/candyblast", requireAdmin, candyblastRoutes);
app.use("/api/tetris", requireAdmin, tetrisRoutes);
app.use("/api/stack", requireAdmin, stackRoutes);
app.use("/api/whackamole", requireAdmin, whackamoleRoutes);
app.use("/api/hanoi", requireAdmin, hanoiRoutes);
app.use("/api/breakout", requireAdmin, breakoutRoutes);
app.use("/api/bubbleshooter", requireAdmin, bubbleshooterRoutes);
app.use("/api/carlaunch", requireAdmin, carlaunchRoutes);
app.use("/api/stressbuster", requireAdmin, stressbusterRoutes);
app.use("/api/soundify", requireAdmin, soundifyRoutes);
app.use("/api/tictactoe", requireAdmin, tictactoeRoutes);
app.use("/api/chess", chessRoutes); // No requireAdmin — GET settings must be accessible to players; PUT/POST routes use their own auth middleware
app.use("/api/snakeandladder", requireAdmin, snakeandladderRoutes);
app.use("/api/ludo", requireAdmin, ludoRoutes);
app.use("/api/Carrom", requireAdmin, CarromRoutes);
app.use("/api/tictactoemulti", requireAdmin, tictactoemultiRoutes);
app.use("/api/bd", businessDevRoutes);
app.use("/api/business", businessOwnerRoutes);
app.use("/api/franchise", franchiseRoutes);
app.use("/api/internal-team", internalTeamRoutes);
app.use("/api/notifications", auth, notificationsRoutes);
app.use("/api/internal-team/notifications", itAuth, notificationsRoutes);
app.use("/api/system", requireAdmin, systemRoutes);
app.use("/api/translate", auth, translateRoutes);

const { startPCResetCron } = require('./cron/pcReset');
startPCResetCron();

app.get("/api/check-code", (req, res) => {
  res.json({ 
    success: true, 
    message: "LATEST_VERSION_V5_BACKEND", 
    timestamp: new Date()
  });
});

app.get("/", (req, res) => {
  // Serve the SPA landing page when the frontend is built; plain text otherwise.
  if (fs.existsSync(INDEX_HTML_PATH)) {
    return res.sendFile(INDEX_HTML_PATH);
  }
  res.send("Backend Running");
});

// ── Social Sharing: Serve frontend HTML with dynamic OG tags ──────────────────
const SOCIAL_BOTS = /facebookexternalhit|twitterbot|whatsapp|slackbot|linkedinbot|pinterest|telegrambot|skypeuribot|naverbot|yandexbot|baiduspider/i;

const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
const INDEX_HTML_PATH = path.join(FRONTEND_DIST, 'index.html');

const OG_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>__TITLE__</title>
    <meta property="og:title" content="__TITLE__" />
    <meta property="og:description" content="__DESCRIPTION__" />
    <meta property="og:image" content="__IMAGE__" />
    <meta property="og:image:width" content="__WIDTH__" />
    <meta property="og:image:height" content="__HEIGHT__" />
    <meta property="og:url" content="__URL__" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="__TITLE__" />
    <meta name="twitter:description" content="__DESCRIPTION__" />
    <meta name="twitter:image" content="__IMAGE__" />
    <meta name="twitter:image:width" content="__WIDTH__" />
    <meta name="twitter:image:height" content="__HEIGHT__" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

// Map each game category to its per-game settings table. Each game builder
// saves its logo + meta_description into its OWN settings table, and social
// crawlers (Facebook/WhatsApp) don't run JS — so we must resolve the right
// table server-side to inject the customized image/text into index.html.
const CATEGORY_SETTINGS = {
  quiz: 'quiz_settings', crossword: 'crossword_settings', spin: 'spin_settings',
  memory: 'memory_settings', jigsaw: 'jigsaw_settings', wordsearch: 'wordsearch_settings',
  pouring: 'pouring_settings', typer: 'typer_settings', screw: 'screw_settings', tower: 'tower_settings',
  math: 'math_settings', maze: 'maze_settings', '2048': 'game2048_settings',
  snake: 'snake_settings', catch: 'catch_settings', reaction: 'reaction_settings',
  simon: 'simon_settings', connect4: 'connect4_settings', flappy: 'flappy_settings',
  bounce: 'bounce_settings', space: 'space_settings', bejeweled: 'bejeweled_settings',
  tetris: 'tetris_settings', stack: 'stack_settings', whackamole: 'whackamole_settings',
  hanoi: 'hanoi_settings', breakout: 'breakout_settings', bubbleshooter: 'bubbleshooter_settings',
  carlaunch: 'carlaunch_settings', tictactoe: 'tictactoe_settings', stressbuster: 'stressbuster_settings',
  soundify: 'soundify_settings', arrowescape: 'arrowescape_settings', bowling: 'bowling_settings',
  sudoku: 'sudoku_settings', minesweeper: 'minesweeper_settings', wordscramble: 'wordscramble_settings',
  rps: 'rps_settings',
  snakeandladder: 'snake_ladder_settings', ludo: 'ludo_settings',
  Carrom: 'Carrom_settings', carrom: 'Carrom_settings', tictactoemultiplayer: 'tictactoe_multi_settings',
};

// Resolve a game's OG title/description/image from its row + category settings
// table. Returns null if the game slug isn't found.
async function resolveGameOG(req, gameSlug, clientSlug) {
  const db = require('./config/db');

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  // LEFT JOIN clients so games with no client still resolve; when a client slug
  // is present allow it to be null (mirrors the /api/play lookup).
  let game;
  if (clientSlug) {
    const [games] = await db.query(`
      SELECT g.id, g.name, g.slug, g.category, g.description, g.meta_description,
             g.game_logo_url as g_logo
      FROM games g LEFT JOIN clients c ON g.client_id = c.id
      WHERE g.slug = ? AND (c.slug = ? OR c.slug IS NULL)
      LIMIT 1
    `, [gameSlug, clientSlug]);
    game = games[0];
  } else {
    const [games] = await db.query(`
      SELECT g.id, g.name, g.slug, g.category, g.description, g.meta_description,
             g.game_logo_url as g_logo
      FROM games g
      WHERE g.slug = ?
      LIMIT 1
    `, [gameSlug]);
    game = games[0];
  }

  if (!game) return null;

  const table = CATEGORY_SETTINGS[game.category];

  let metaDesc = game.meta_description || null;
  let logo = game.g_logo || null;

  if (table) {
    try {
      const [rows] = await db.query(
        `SELECT game_logo_url, meta_description FROM ${table} WHERE game_id = ? ORDER BY id DESC LIMIT 1`,
        [game.id]
      );
      if (rows[0]) {
        if (rows[0].game_logo_url) logo = rows[0].game_logo_url;
        if (rows[0].meta_description) metaDesc = rows[0].meta_description;
      }
    } catch (e) {
      console.error('OG settings lookup error:', e.message);
    }
  }

  const toAbs = (url) => url && (url.startsWith('http') ? url : `${baseUrl}${url}`);
  const image = toAbs(logo) || `${baseUrl}/og-image.png`;
  const title = game.name || 'Play this game';
  const description = metaDesc || game.description || `Play ${game.name} and win exciting rewards!`;
  const url = `${baseUrl}${req.originalUrl.split('?')[0]}`;

  // Detect the logo's real pixel dimensions so the og:image:width/height tags
  // are accurate regardless of orientation (landscape/square/portrait logos).
  // Pass the raw source (relative path or remote URL) so local uploads are read
  // straight off disk instead of round-tripping through an HTTP fetch.
  // Falls back to 1200x630 if detection fails.
  const size = await detectImageSize(logo);

  return { title, description, image, url, width: size.width, height: size.height };
}

// Determine the pixel width/height of an OG image as fast as possible.
// - Local upload paths (e.g. /uploads/images/x.png) are read from disk via sharp.
// - Remote URLs are fetched and parsed with sharp.
// Falls back to 1200x630 on any error so crawlers get something to work with.
async function detectImageSize(imageSrc) {
  const fallback = { width: 1200, height: 630 };
  if (!imageSrc) return fallback;
  try {
    const sharp = require('sharp');
    let buffer;
    if (/^https?:\/\//i.test(imageSrc)) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      try {
        const resp = await fetch(imageSrc, { signal: ctrl.signal });
        t.clearTimeout();
        if (!resp.ok) return fallback;
        const arr = await resp.arrayBuffer();
        buffer = Buffer.from(arr);
      } catch {
        t.clearTimeout();
        return fallback;
      }
    } else {
      // Local path: server.js lives in apps/backend, uploads under ./uploads
      const localPath = path.join(__dirname, imageSrc.replace(/^\//, ''));
      if (!fs.existsSync(localPath)) return fallback;
      buffer = fs.readFileSync(localPath);
    }
    const meta = await sharp(buffer).metadata();
    if (meta.width && meta.height) return { width: meta.width, height: meta.height };
  } catch (e) {
    console.error('OG image size detection error:', e.message);
  }
  return fallback;
}

// Render the OG template from resolved metadata.
function renderOG(meta) {
  return OG_TEMPLATE
    .replace(/__TITLE__/g, meta.title)
    .replace(/__DESCRIPTION__/g, meta.description)
    .replace(/__IMAGE__/g, meta.image)
    .replace(/__WIDTH__/g, meta.width || 1200)
    .replace(/__HEIGHT__/g, meta.height || 630)
    .replace(/__URL__/g, meta.url);
}

// Serve static frontend assets in production.
// Hashed build assets are immutable → long cache; index.html stays fresh so
// new deployments are picked up immediately (PageSpeed: efficient cache policy).
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }));
}

// Serve frontend HTML with OG tags for social media crawlers.
// Two-segment URL: /play/:gameSlug/:clientSlug (branded game share link)
app.get('/play/:gameSlug/:clientSlug', async (req, res) => {
  const ua = req.headers['user-agent'] || '';

  if (SOCIAL_BOTS.test(ua)) {
    try {
      const meta = await resolveGameOG(req, req.params.gameSlug, req.params.clientSlug);
      if (meta) {
        return res.type('html').send(renderOG(meta));
      }
    } catch (err) {
      console.error('OG tag error:', err.message);
    }
  }

  // For regular users, serve the SPA index.html (React Router handles routing)
  if (fs.existsSync(INDEX_HTML_PATH)) {
    return res.sendFile(INDEX_HTML_PATH);
  }
  res.status(404).send('Frontend not built. Run npm run build first.');
});

// Single-segment player URL (e.g. /play/guess-the-hair-style) — matching the
// frontend route `/play/:gameName` for un-branded games.
app.get('/play/:gameSlug', async (req, res) => {
  const ua = req.headers['user-agent'] || '';

  if (SOCIAL_BOTS.test(ua)) {
    try {
      const meta = await resolveGameOG(req, req.params.gameSlug, null);
      if (meta) {
        return res.type('html').send(renderOG(meta));
      }
    } catch (err) {
      console.error('OG tag error:', err.message);
    }
  }

  // For regular users, serve the SPA index.html (React Router handles routing)
  if (fs.existsSync(INDEX_HTML_PATH)) {
    return res.sendFile(INDEX_HTML_PATH);
  }
  res.status(404).send('Frontend not built. Run npm run build first.');
});

// Catch-all: serve frontend for any non-API route (SPA fallback)
app.get('/{*splat}', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  if (fs.existsSync(INDEX_HTML_PATH)) {
    return res.sendFile(INDEX_HTML_PATH);
  }
  res.send('Backend Running');
});

// ── Global error handler (Layer 5): never leak stack traces / internal errors ──
app.use((err, req, res, next) => {
  if (err && err.message === 'CORS origin not allowed') {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }
  console.error('Unhandled error:', err && err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 8080;

// Run DB migrations on startup (idempotent — safe to run every time)
const initDB = require('./config/initDB');
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Auto-start the translation companion (LibreTranslate) so it comes up
      // with the backend — no manual step on restart.
      startCompanion();
    });

    const shutdown = () => {
      stopCompanion();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })
  .catch(err => {
    console.error('❌ DB init failed:', err.message);
    process.exit(1);
  });
