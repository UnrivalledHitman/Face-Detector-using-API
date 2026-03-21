const express = require("express");
const db = require("../db");

const router = express.Router();

// POST /image — increments the image submission count for a user
router.post("/", async (req, res) => {
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

module.exports = router;
