const express = require("express");
const cors = require("cors");
const path = require("path");
// Load env FIRST so all routes have access
require('dotenv').config({ path: __dirname + '/backend/.env' });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "backend/uploads")));

const authRoutes = require("./backend/routes/auth");
const pauthRoutes = require("./backend/routes/Pauth");
const gamesRoutes = require("./backend/routes/games");
const soundsRoutes = require("./backend/routes/sounds");
const uploadRoutes = require("./backend/routes/upload");
const quizRoutes = require("./backend/routes/quiz");
const playerRoutes = require("./backend/routes/player");
const clientsRoutes = require("./backend/routes/clients");
const spinRoutes = require("./backend/routes/spin");
const crosswordRoutes = require("./backend/routes/crossword");
const leaderboardRoutes = require("./backend/routes/leaderboard");
const playersAdminRoutes = require("./backend/routes/players-admin");
const { startPCResetCron } = require("./backend/cron/pcReset");

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

app.get("/api/check-code", (req, res) => {
  res.json({ 
    success: true, 
    message: "LATEST_VERSION_V5", 
    timestamp: new Date(),
    file: __filename
  });
});

app.get("/", (req, res) => {
  res.send("Backend Running");
});

// Start PC monthly reset cron job
startPCResetCron();

app.listen(5050, () => {
  console.log("Server running on port 5050");
});
