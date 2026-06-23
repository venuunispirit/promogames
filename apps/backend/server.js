const express = require("express");
const cors = require("cors");
const path = require("path");
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
