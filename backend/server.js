const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 SECRET KEY (later move to .env)
const JWT_SECRET = "empwell_secret_key";

// 🧠 TEMP USER (for testing)
const user = {
  email: "admin@empwell.com",
  password: bcrypt.hashSync("123456", 10),
};

// ✅ LOGIN API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email !== user.email) {
    return res.status(400).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

  res.json({
    message: "Login successful",
    token,
  });
});

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.listen(5050, () => {
  console.log("Server running on port 5050");
});