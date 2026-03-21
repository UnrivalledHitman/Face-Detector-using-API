require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const signinRouter = require("./routes/signin");
const registerRouter = require("./routes/register");
const profileRouter = require("./routes/profile");
const imageRouter = require("./routes/image");
const rankRouter = require("./routes/rank");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/signin", signinRouter);
app.use("/register", registerRouter);
app.use("/profile", profileRouter);
app.use("/image", imageRouter);
app.use("/rank", rankRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Backend server running on port ${process.env.PORT || 3000}.`);
});
