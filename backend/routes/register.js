const express = require("express");
const argon2 = require("argon2");
const db = require("../db");

const router = express.Router();

// Basic RFC-5322-inspired email format check (no external deps).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /register — creates a new user account
router.post("/", async (req, res) => {
  const { email, name, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();
  const normalizedName = name?.trim();

  if (!normalizedEmail || !normalizedName || !password) {
    return res.status(400).json("Email, name, and password are required");
  }

  if (!EMAIL_RE.test(normalizedEmail)) {
    return res.status(400).json("Invalid email address");
  }

  if (password.length < 8) {
    return res.status(400).json("Password must be at least 8 characters");
  }

  try {
    // Check for duplicate email in login table
    const emailExists = await db.login.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
      select: { id: true },
    });
    if (emailExists) {
      return res.status(409).json("An account with this email already exists");
    }

    // Check for duplicate name in users table
    const nameExists = await db.user.findFirst({
      where: { name: { equals: normalizedName, mode: "insensitive" } },
      select: { id: true },
    });
    if (nameExists) {
      return res.status(409).json("This username is already taken");
    }

    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    // Transaction — both inserts succeed or both roll back
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: normalizedName,
          email: normalizedEmail,
          entries: 0,
          joined: new Date(),
        },
      });

      await tx.login.create({
        data: { id: user.id, email: normalizedEmail, hash },
      });

      return user;
    });

    return res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error registering user");
  }
});

module.exports = router;
