const express = require("express");
const argon2 = require("argon2");
const db = require("../db");

const router = express.Router();

// POST /signin — authenticates an existing user
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("Email and password are required");
  }

  try {
    // Find the login row by email
    const loginRow = await db("login").where({ email }).first();
    if (!loginRow) {
      return res.status(400).json("Invalid credentials");
    }

    // Verify password against stored hash
    const valid = await argon2.verify(loginRow.hash, password);
    if (!valid) {
      return res.status(400).json("Invalid credentials");
    }

    // Fetch full profile from users table
    const user = await db("users").where({ id: loginRow.id }).first();
    return res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error signing in");
  }
});

module.exports = router;
