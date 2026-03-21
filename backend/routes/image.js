const express = require("express");
const db = require("../db");

const router = express.Router();

// POST /image — increments the image submission count for a user
router.post("/", async (req, res) => {
  const id = Number(req.body.id);

  if (Number.isNaN(id)) {
    return res.status(400).json("Invalid user id");
  }

  try {
    const updated = await db.user.update({
      where: { id },
      data: { entries: { increment: 1 } },
      select: { entries: true },
    });

    return res.json({ entries: updated.entries });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json("User not found");
    }
    console.error(err);
    res.status(500).json("Error updating entries");
  }
});

module.exports = router;
