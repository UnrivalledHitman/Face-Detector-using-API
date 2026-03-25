const express = require("express");
const db = require("../db");

module.exports = (io) => {
  const router = express.Router();

  // POST /imageurl — backward-compatible endpoint after moving detection client-side
  router.post("/", async (req, res) => {
    const id = Number(req.body.id);

    if (Number.isNaN(id)) {
      return res.json({
        boxes: [],
        entries: null,
        message:
          "Face detection now runs in the frontend with face-api.js. Use POST /image to increment entries.",
      });
    }

    try {
      const updated = await db.user.update({
        where: { id },
        data: { entries: { increment: 1 } },
        select: { entries: true },
      });

      io.emit("entryUpdated", { userId: id, entries: updated.entries });
      return res.json({ boxes: [], entries: updated.entries });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json("User not found");
      }
      console.error(err);
      res.status(500).json("Error updating entries");
    }
  });

  return router;
};
