const express = require("express");
const bodyParser = require("body-parser");
const argon2 = require("argon2"); // Argon2 is a password hashing library, winner of the Password Hashing Competition
const { randomUUID } = require("crypto"); // Built-in Node.js crypto module for generating unique IDs

const app = express();
app.use(bodyParser.json()); // Middleware that parses incoming JSON request bodies into req.body

// In-memory database object holding a users array (replace with a real DB in production)
const database = {
  users: [],
};

// POST /signin — authenticates an existing user with email and password
app.post("/signin", async (req, res) => {
  // Destructure email and password from the parsed request body
  const { email, password } = req.body;

  // Check that both fields exist; return 400 if either is missing
  if (!email || !password) {
    return res.status(400).json("Email and password are required");
  }

  // Search the users array for a matching email address
  const user = database.users.find((u) => u.email === email);

  // argon2.verify() compares the plain-text password against the stored hash —
  // we verify rather than re-hash because argon2 is intentionally slow and salted
  if (user && (await argon2.verify(user.password, password))) {
    // Use destructuring to pull out (and discard) the password field,
    // spreading the rest into safeUser to avoid leaking the hash to the client
    const { password: _, ...safeUser } = user;
    return res.json(safeUser);
  }

  // Return a generic error message — avoids revealing whether the email
  // exists in the database (a.k.a. user enumeration attack)
  res.status(400).json("Invalid credentials");
});

// GET /profile/:id — fetches a single user's public profile by their ID
app.get("/profile/:id", (req, res) => {
  // Extract the id segment from the URL parameters (e.g. /profile/abc-123)
  const { id } = req.params;

  // Search the users array for a user whose id matches the URL parameter
  const user = database.users.find((u) => u.id === id);
  if (user) {
    // Strip the password hash before sending — profile data should never
    // expose internal security fields to the client
    const { password: _, ...safeUser } = user;
    return res.json(safeUser);
  }

  // No user matched the given ID — return a 404
  res.status(404).json("User not found");
});

// POST /register — creates and stores a new user account
app.post("/register", async (req, res) => {
  // Destructure the three required fields from the request body
  const { email, name, password } = req.body;

  // Validate all fields are present before doing any work
  if (!email || !name || !password) {
    return res.status(400).json("Email, name, and password are required");
  }

  try {
    // Hash the plain-text password with argon2id — explicitly configured to
    // meet OWASP minimum recommendations: 19 MiB memory, 2 iterations, 1 parallelism.
    // argon2.argon2id selects the hybrid variant, which is resistant to both
    // side-channel attacks (argon2i) and GPU brute-force attacks (argon2d).
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456, // 19 MiB in KiB (19 * 1024)
      timeCost: 2, // Number of iterations
      parallelism: 1, // Degree of parallelism
    });

    // Build the new user object to be stored in the database
    const newUser = {
      id: randomUUID(), // randomUUID() produces a cryptographically random UUID v4 — avoids duplicate IDs
      name,
      email,
      password: hash, // Store only the hash, never the plain-text password
      entries: 0, // Tracks how many images the user has submitted
      joined: new Date(), // Timestamp of when the account was created
    };

    // Append the new user to the in-memory users array
    database.users.push(newUser);

    // Remove the password hash from the response object before sending
    // back to the client — the client only needs the public user data
    const { password: _, ...safeUser } = newUser;
    return res.json(safeUser);
  } catch (err) {
    // Log the full error server-side for debugging, but send a generic
    // message to the client to avoid leaking implementation details
    console.error(err);
    res.status(500).json("Error registering user");
  }
});

// POST /image — increments the image submission count for a given user
app.post("/image", (req, res) => {
  // Extract the user ID from the request body
  const { id } = req.body;

  // Use find() instead of forEach() so we can exit early once the user is located
  const user = database.users.find((u) => u.id === id);
  if (user) {
    // Mutate the entries count directly on the in-memory object and return the updated value
    user.entries += 1;
    return res.json({ entries: user.entries });
  }

  // No user matched the provided ID — return a 404
  res.status(404).json("User not found");
});

app.listen(3000, () => {
  console.log("Backend server running on 3000.");
});
