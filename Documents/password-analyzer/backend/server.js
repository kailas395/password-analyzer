const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let oldPasswords = [];

// ✅ Strength function
function calculateStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let strength = "Weak";
  if (score >= 4) strength = "Medium";
  if (score === 5 && password.length >= 12) strength = "Strong";

  return { score, strength };
}

// ✅ API route
app.post("/check-password", async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password required" });
  }

  const { score, strength } = calculateStrength(password);

  // 🔥 Check reuse
  let reused = false;

  for (let hash of oldPasswords) {
    const match = await bcrypt.compare(password, hash);
    if (match) {
      reused = true;
      break;
    }
  }

  // 🔐 Store password
  const hashed = await bcrypt.hash(password, 10);
  oldPasswords.push(hashed);

  // ✅ Send correct response
  res.json({
    strength,
    score,
    reused,
    message: reused
      ? "Password already used ⚠️"
      : "Secure password ✅"
  });
});

// Health check
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});