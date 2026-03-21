const express = require("express");
const argon2 = require("argon2");
const db = require("../db");

const router = express.Router();

// POST /register — creates a new user account
router.post("/", async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json("Email, name, and password are required");
  }

  try {
    // Check for duplicate email in login table
    const emailExists = await db("login")
      .whereRaw("LOWER(email) = ?", [email.toLowerCase()])
      .first();
    if (emailExists) {
      return res.status(409).json("An account with this email already exists");
    }

    // Check for duplicate name in users table
    const nameExists = await db("users")
      .whereRaw("LOWER(name) = ?", [name.toLowerCase()])
      .first();
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
    const newUser = await db.transaction(async (trx) => {
      const [user] = await trx("users")
        .insert({ name, email, entries: 0, joined: new Date() })
        .returning("*");

      await trx("login").insert({ id: user.id, email, hash });

      return user;
    });

    return res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error registering user");
  }
});

module.exports = router;
