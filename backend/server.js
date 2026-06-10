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

app.get("/", (req, res) => {
  res.send("Backend Running");
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
