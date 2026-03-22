const express = require("express");
const db = require("../db");

const router = express.Router();
const LEADERBOARD_TTL_MS = 5000;
const TOTAL_USERS_TTL_MS = 30000;

const leaderboardCache = new Map();
let totalUsersCache = { value: null, at: 0 };

// GET /rank/leaderboard — returns all users sorted by entries descending
router.get("/leaderboard", async (req, res) => {
  const limit = Number(req.query.limit) || 100;
  const safeLimit = Math.min(limit, 500);
  const cached = leaderboardCache.get(safeLimit);

  if (cached && Date.now() - cached.at < LEADERBOARD_TTL_MS) {
    return res.json(cached.value);
  }

  try {
    const rows = await db.user.findMany({
      select: { id: true, name: true, entries: true, joined: true },
      orderBy: [{ entries: "desc" }, { joined: "asc" }],
      take: safeLimit,
    });

    const leaderboard = rows.map((row, index) => ({
      id: row.id,
      name: row.name,
      entries: row.entries,
      rank: index + 1,
    }));

    leaderboardCache.set(safeLimit, { value: leaderboard, at: Date.now() });

    return res.json(leaderboard);
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error fetching leaderboard");
  }
});

// GET /rank/:id — returns the user's rank compared to all other users
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json("Invalid user id");
  }

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, entries: true },
    });
    if (!user) return res.status(404).json("User not found");

    // Count users with strictly more entries
    const higher = await db.user.count({
      where: { entries: { gt: user.entries } },
    });

    const now = Date.now();
    let total = totalUsersCache.value;
    if (total === null || now - totalUsersCache.at >= TOTAL_USERS_TTL_MS) {
      total = await db.user.count();
      totalUsersCache = { value: total, at: now };
    }

    return res.json({
      rank: higher + 1,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error fetching rank");
  }
});

module.exports = router;
