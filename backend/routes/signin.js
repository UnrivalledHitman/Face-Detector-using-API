const express = require("express");
const argon2 = require("argon2");
const db = require("../db");

const router = express.Router();

// POST /signin — authenticates an existing user
router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json("Username and password are required");
  }

  try {
    const userRow = await db.user.findFirst({
      where: {
        name: { equals: username.toLowerCase().trim(), mode: "insensitive" },
      },
    });

    if (!userRow) {
      return res.status(400).json("Invalid credentials");
    }

    // Find the login row by user id
    const loginRow = await db.login.findUnique({ where: { id: userRow.id } });
    if (!loginRow) {
      return res.status(400).json("Invalid credentials");
    }

    // Verify password against stored hash
    const valid = await argon2.verify(loginRow.hash, password);
    if (!valid) {
      return res.status(400).json("Invalid credentials");
    }

    // Fetch full profile from users table
    const user = await db.user.findUnique({ where: { id: userRow.id } });
    return res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error signing in");
  }
});

module.exports = router;
