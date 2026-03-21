require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const ensureSchema = require("./utils/ensureSchema");

const signinRouter = require("./routes/signin");
const registerRouter = require("./routes/register");
const profileRouter = require("./routes/profile");
const imageurlRouter = require("./routes/imageurl");
const rankRouter = require("./routes/rank");
const passwordRouter = require("./routes/password");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(bodyParser.json());

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Routes
app.use("/signin", signinRouter);
app.use("/register", registerRouter);
app.use("/profile", profileRouter);
app.use("/imageurl", imageurlRouter(io));
app.use("/rank", rankRouter);
app.use("/password", passwordRouter);

ensureSchema()
  .then(() => {
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Backend server running on port ${port}.`);
    });
  })
  .catch((err) => {
    console.error("Schema initialization failed", err);
    process.exit(1);
  });
