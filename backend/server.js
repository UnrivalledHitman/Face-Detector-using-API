require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const createApp = require("./app");
const db = require("./db");

const ioStub = { emit: () => {} };
const app = createApp(ioStub);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (process.env.FRONTEND_URL || "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim()),
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Rebind image emitter for local/dev realtime updates.
ioStub.emit = io.emit.bind(io);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Backend server running on port ${port}.`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});

async function shutdown(signal) {
  console.log(`${signal} received — shutting down gracefully.`);
  server.close(async () => {
    try {
      await db.$disconnect();
    } catch (e) {
      console.error("Error disconnecting from database:", e);
    }
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
