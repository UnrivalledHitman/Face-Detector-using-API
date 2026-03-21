const db = require("../db");

async function ensureSchema() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      entries INTEGER NOT NULL DEFAULT 0,
      joined TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS login (
      id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      hash TEXT NOT NULL
    );
  `);

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(128) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await db.$executeRawUnsafe(
    "CREATE INDEX IF NOT EXISTS password_reset_tokens_user_used_idx ON password_reset_tokens (user_id, used)",
  );
  await db.$executeRawUnsafe(
    "CREATE INDEX IF NOT EXISTS password_reset_tokens_exp_idx ON password_reset_tokens (expires_at)",
  );

  // Enforce case-insensitive uniqueness at DB level.
  await db.$executeRawUnsafe(
    "CREATE UNIQUE INDEX IF NOT EXISTS users_name_lower_unique_idx ON users ((LOWER(name)))",
  );
  await db.$executeRawUnsafe(
    "CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique_idx ON users ((LOWER(email)))",
  );
  await db.$executeRawUnsafe(
    "CREATE UNIQUE INDEX IF NOT EXISTS login_email_lower_unique_idx ON login ((LOWER(email)))",
  );
}

module.exports = ensureSchema;
