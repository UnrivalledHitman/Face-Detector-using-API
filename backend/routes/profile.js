const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /profile/:id — fetches a user's profile
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json("Invalid user id");
  }

  try {
    const user = await db.user.findUnique({ where: { id } });
    if (user) return res.json(user);
    res.status(404).json("User not found");
  } catch (err) {
    console.error(err);
    res.status(500).json("Error fetching profile");
  }
});

module.exports = router;
