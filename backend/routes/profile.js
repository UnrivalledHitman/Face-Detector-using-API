const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /profile/:id — fetches a user's profile
router.get("/:id", async (req, res) => {
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

module.exports = router;
