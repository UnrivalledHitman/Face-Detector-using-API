const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("This is working");
});

app.listen(3000, () => {
  console.log("Backend server running on 3000.");
});
