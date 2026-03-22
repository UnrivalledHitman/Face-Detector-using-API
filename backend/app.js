require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const ensureSchema = require("./utils/ensureSchema");

const signinRouter = require("./routes/signin");
const registerRouter = require("./routes/register");
const profileRouter = require("./routes/profile");
const imageurlRouter = require("./routes/imageurl");
const rankRouter = require("./routes/rank");
const passwordRouter = require("./routes/password");

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

// Initialize schema once per process. In serverless this runs on cold start.
const schemaReady = ensureSchema().catch((err) => {
  console.error("Schema initialization failed", err);
  throw err;
});

function createApp(io = { emit: () => {} }) {
  const app = express();

  app.use(async (_req, res, next) => {
    try {
      await schemaReady;
      next();
    } catch {
      res.status(500).json("Database initialization failed");
    }
  });

  app.use(cors(corsOptions));
  app.use(bodyParser.json({ limit: "10mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/signin", signinRouter);
  app.use("/register", registerRouter);
  app.use("/profile", profileRouter);
  app.use("/imageurl", imageurlRouter(io));
  app.use("/rank", rankRouter);
  app.use("/password", passwordRouter);

  return app;
}

module.exports = createApp;
