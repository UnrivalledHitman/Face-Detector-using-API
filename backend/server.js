const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const argon2 = require("argon2");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "In@23112",
    database: "face_detector",
  },
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// POST /signin
// Looks up email in `login`, verifies hash, then fetches profile from `users`
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json("Email and password are required");
  }

  try {
    // Step 1 — find the login row by email
    const loginRow = await db("login").where({ email }).first();
    if (!loginRow) {
      return res.status(400).json("Invalid credentials");
    }

    // Step 2 — verify the password against the stored hash
    const valid = await argon2.verify(loginRow.hash, password);
    if (!valid) {
      return res.status(400).json("Invalid credentials");
    }

    // Step 3 — fetch the full user profile from `users` by matching id
    const user = await db("users").where({ id: loginRow.id }).first();
    return res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error signing in");
  }
});

// GET /profile/:id — fetches a user's profile from `users`
app.get("/profile/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await db("users").where({ id }).first();
    if (user) return res.json(user);
    res.status(404).json("User not found");
  } catch (err) {
    console.error(err);
    res.status(500).json("Error fetching profile");
  }
});

// POST /register
// Inserts into `users` first to get the auto-generated id,
// then inserts email + hash into `login` using that same id
app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json("Email, name, and password are required");
  }

  try {
    // Check for duplicate email in `login`
    const emailExists = await db("login")
      .whereRaw("LOWER(email) = ?", [email.toLowerCase()])
      .first();
    if (emailExists) {
      return res.status(409).json("An account with this email already exists");
    }

    // Check for duplicate name in `users`
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

    // Use a transaction so both inserts succeed or both roll back
    const newUser = await db.transaction(async (trx) => {
      // Insert into `users` and get the auto-generated id back
      const [user] = await trx("users")
        .insert({ name, email, entries: 0, joined: new Date() })
        .returning("*");

      // Insert into `login` using the same id
      await trx("login").insert({ id: user.id, email, hash });

      return user;
    });

    return res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error registering user");
  }
});

// POST /image — increments entries for a user in `users`
app.post("/image", async (req, res) => {
  const { id } = req.body;

  try {
    const [updated] = await db("users")
      .where({ id })
      .increment("entries", 1)
      .returning("entries");

    if (updated) return res.json({ entries: updated.entries });
    res.status(404).json("User not found");
  } catch (err) {
    console.error(err);
    res.status(500).json("Error updating entries");
  }
});

// GET /rank/:id — returns rank and total from `users`
app.get("/rank/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await db("users").where({ id }).first();
    if (!user) return res.status(404).json("User not found");

    const [{ count: higher }] = await db("users")
      .where("entries", ">", user.entries)
      .count("id as count");

    const [{ count: total }] = await db("users").count("id as count");

    return res.json({
      rank: parseInt(higher) + 1,
      total: parseInt(total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error fetching rank");
  }
});

app.listen(3000, () => {
  console.log("Backend server running on 3000.");
});
