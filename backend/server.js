const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const argon2 = require("argon2");
const { randomUUID } = require("crypto");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const database = {
  users: [],
};

const seedUsers = async () => {
  const usersData = [
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: "password123",
    },
    { name: "Bob Smith", email: "bob@example.com", password: "letmein456" },
    { name: "Carol White", email: "carol@example.com", password: "carol789" },
  ];

  for (const u of usersData) {
    const hash = await argon2.hash(u.password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    database.users.push({
      id: randomUUID(),
      name: u.name,
      email: u.email,
      password: hash,
      entries: Math.floor(Math.random() * 20),
      joined: new Date(),
    });
  }

  console.log("Seeded 3 test users.");
};

seedUsers();

// POST /signin — authenticates an existing user
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json("Email and password are required");
  }
  const user = database.users.find((u) => u.email === email);
  if (user && (await argon2.verify(user.password, password))) {
    const { password: _, ...safeUser } = user;
    return res.json(safeUser);
  }
  res.status(400).json("Invalid credentials");
});

// GET /profile/:id — fetches a user's profile
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  const user = database.users.find((u) => u.id === id);
  if (user) {
    const { password: _, ...safeUser } = user;
    return res.json(safeUser);
  }
  res.status(404).json("User not found");
});

// POST /register — creates a new user account
app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;

  // Check all fields are present
  if (!email || !name || !password) {
    return res.status(400).json("Email, name, and password are required");
  }

  // Check for duplicate email — case-insensitive
  const emailExists = database.users.some(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (emailExists) {
    return res.status(409).json("An account with this email already exists");
  }

  // Check for duplicate name — case-insensitive
  const nameExists = database.users.some(
    (u) => u.name.toLowerCase() === name.toLowerCase(),
  );
  if (nameExists) {
    return res.status(409).json("This username is already taken");
  }

  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    const newUser = {
      id: randomUUID(),
      name,
      email,
      password: hash,
      entries: 0,
      joined: new Date(),
    };
    database.users.push(newUser);
    const { password: _, ...safeUser } = newUser;
    return res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error registering user");
  }
});

// POST /image — increments the image submission count for a user
app.post("/image", (req, res) => {
  const { id } = req.body;
  const user = database.users.find((u) => u.id === id);
  if (user) {
    user.entries += 1;
    return res.json({ entries: user.entries });
  }
  res.status(404).json("User not found");
});

// GET /rank/:id — returns the user's rank compared to all other users
app.get("/rank/:id", (req, res) => {
  const { id } = req.params;
  const user = database.users.find((u) => u.id === id);
  if (!user) return res.status(404).json("User not found");

  // Rank = count of users with strictly more entries + 1
  const rank =
    database.users.filter((u) => u.entries > user.entries).length + 1;
  return res.json({ rank, total: database.users.length });
});

app.listen(3000, () => {
  console.log("Backend server running on 3000.");
});
