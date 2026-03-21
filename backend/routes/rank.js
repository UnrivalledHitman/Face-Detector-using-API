const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /rank/:id — returns the user's rank compared to all other users
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await db("users").where({ id }).first();
    if (!user) return res.status(404).json("User not found");

    // Count users with strictly more entries
    const [{ count: higher }] = await db("users")
      .where("entries", ">", user.entries)
      .count("id as count");

    // Count total users
    const [{ count: total }] = await db("users").count("id as count");

    return res.json({
      rank: parseInt(higher) + 1,
      total: parseInt(total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error fetching rank");
  }
});

module.exports = router;
