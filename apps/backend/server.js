const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/auth");
const pauthRoutes = require("./routes/Pauth");
const gamesRoutes = require("./routes/games");
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
const businessDevRoutes = require("./routes/businessDev");
const businessOwnerRoutes = require("./routes/businessOwner");
const internalTeamRoutes = require("./routes/internalTeam");
const { itAuth } = internalTeamRoutes;
const auth = require("./middleware/auth");
const notificationsRoutes = require("./routes/notifications");
const systemRoutes = require("./routes/system");

app.use("/api/auth", authRoutes);
app.use("/api/pauth", pauthRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/sounds", soundsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/play", playerRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/spin", spinRoutes);
app.use("/api/crossword", crosswordRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/players-admin", playersAdminRoutes);
app.use("/api/memory", memoryRoutes);
app.use("/api/jigsaw", jigsawRoutes);
app.use("/api/wordsearch", wordsearchRoutes);
app.use("/api/pouring", pouringRoutes);
app.use("/api/typer", typerRoutes);
app.use("/api/screw", screwRoutes);
app.use("/api/snake", snakeRoutes);
app.use("/api/catch", catchRoutes);
app.use("/api/reaction", reactionRoutes);
app.use("/api/math", mathRoutes);
app.use("/api/maze", mazeRoutes);
app.use("/api/2048", game2048Routes);
app.use("/api/simon", simonRoutes);
app.use("/api/bounce", bounceRoutes);
app.use("/api/flappy", flappyRoutes);
app.use("/api/canva", canvaRoutes);
app.use("/api/connect4", connect4Routes);
app.use("/api/brick-images", brickImagesRoutes);
app.use("/api/bowling", bowlingRoutes);
app.use("/api/sudoku", sudokuRoutes);
app.use("/api/minesweeper", minesweeperRoutes);
app.use("/api/wordscramble", wordscrambleRoutes);
app.use("/api/rps", rpsRoutes);
app.use("/api/arrowescape", arrowescapeRoutes);
app.use("/api/space", spaceRoutes);
app.use("/api/bejeweled", bejeweledRoutes);
app.use("/api/tetris", tetrisRoutes);
app.use("/api/stack", stackRoutes);
app.use("/api/whackamole", whackamoleRoutes);
app.use("/api/hanoi", hanoiRoutes);
app.use("/api/breakout", breakoutRoutes);
app.use("/api/bubbleshooter", bubbleshooterRoutes);
app.use("/api/carlaunch", carlaunchRoutes);
app.use("/api/stressbuster", stressbusterRoutes);
app.use("/api/soundify", soundifyRoutes);
app.use("/api/tictactoe", tictactoeRoutes);
app.use("/api/bd", businessDevRoutes);
app.use("/api/business", businessOwnerRoutes);
app.use("/api/internal-team", internalTeamRoutes);
app.use("/api/notifications", auth, notificationsRoutes);
app.use("/api/internal-team/notifications", itAuth, notificationsRoutes);
app.use("/api/system", systemRoutes);

const { startPCResetCron } = require('./cron/pcReset');
startPCResetCron();

app.get("/api/check-code", (req, res) => {
  res.json({ 
    success: true, 
    message: "LATEST_VERSION_V5_BACKEND", 
    timestamp: new Date(),
    file: __filename
  });
});

app.get("/", (req, res) => {
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
    <meta property="og:url" content="__URL__" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="__TITLE__" />
    <meta name="twitter:description" content="__DESCRIPTION__" />
    <meta name="twitter:image" content="__IMAGE__" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

// Serve static frontend assets in production
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
}

// Serve frontend HTML with OG tags for social media crawlers
app.get('/play/:gameSlug/:clientSlug', async (req, res) => {
  const ua = req.headers['user-agent'] || '';

  if (SOCIAL_BOTS.test(ua)) {
    try {
      const db = require('./config/db');
      const [rows] = await db.query(`
        SELECT g.name, g.slug, g.description, g.meta_description, g.game_logo_url as g_logo,
               COALESCE(qs.game_logo_url, g.game_logo_url) as game_logo_url,
               qs.bg_image_url,
               c.company_name, c.slug as client_slug
        FROM games g JOIN clients c ON g.client_id = c.id
        LEFT JOIN quiz_settings qs ON qs.game_id = g.id
        WHERE g.slug = ? AND c.slug = ?
      `, [req.params.gameSlug, req.params.clientSlug]);

      if (rows.length > 0) {
        const game = rows[0];
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const gameUrl = `${baseUrl}/play/${game.slug}/${game.client_slug}`;
        const title = game.name || 'Play this game';
        const description = game.meta_description || game.description || `Play ${game.name} and win exciting rewards!`;
        const image = game.game_logo_url
          ? (game.game_logo_url.startsWith('http') ? game.game_logo_url : `${baseUrl}${game.game_logo_url}`)
          : `${baseUrl}/favicon.png`;

        let html = OG_TEMPLATE
          .replace(/__TITLE__/g, title)
          .replace(/__DESCRIPTION__/g, description)
          .replace(/__IMAGE__/g, image)
          .replace(/__URL__/g, gameUrl);

        return res.type('html').send(html);
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

const PORT = process.env.PORT || 8080;

// Run DB migrations on startup (idempotent — safe to run every time)
const initDB = require('./config/initDB');
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ DB init failed:', err.message);
    process.exit(1);
  });
