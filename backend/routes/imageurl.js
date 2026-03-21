const express = require("express");
const db = require("../db");

module.exports = (io) => {
  const router = express.Router();

  // POST /imageurl — calls Clarifai, returns boxes, increments user entries
  router.post("/", async (req, res) => {
    const { url, id } = req.body;

    if (!url) {
      return res.status(400).json("Image URL is required");
    }

    const raw = JSON.stringify({
      user_app_id: {
        user_id: process.env.CLARIFAI_USER_ID,
        app_id: process.env.CLARIFAI_APP_ID,
      },
      inputs: [{ data: { image: { url } } }],
    });

    try {
      // Call Clarifai API from the backend — PAT never exposed to browser
      const clarifaiRes = await fetch(
        `https://api.clarifai.com/v2/models/${process.env.CLARIFAI_MODEL_ID}/versions/${process.env.CLARIFAI_MODEL_VERSION_ID}/outputs`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Key ${process.env.CLARIFAI_PAT}`,
          },
          body: raw,
        },
      );

      const result = await clarifaiRes.json();

      if (!result.outputs?.[0]?.data?.regions) {
        return res.status(400).json("No faces detected");
      }

      // Calculate bounding boxes as percentages
      const boxes = result.outputs[0].data.regions.map((region) => {
        const { top_row, left_col, bottom_row, right_col } =
          region.region_info.bounding_box;
        return {
          topRow: top_row * 100,
          leftCol: left_col * 100,
          bottomRow: (1 - bottom_row) * 100,
          rightCol: (1 - right_col) * 100,
        };
      });

      // If user is logged in, increment their entries and return updated count
      let entries = null;
      if (id) {
        const userId = Number(id);
        if (!Number.isNaN(userId)) {
          try {
            const updated = await db.user.update({
              where: { id: userId },
              data: { entries: { increment: 1 } },
              select: { entries: true },
            });
            if (updated) {
              entries = updated.entries;
              io.emit("entryUpdated", { userId, entries });
            }
          } catch (dbErr) {
            if (dbErr.code !== "P2025") {
              throw dbErr;
            }
          }
        }
      }

      return res.json({ boxes, entries });
    } catch (err) {
      console.error(err);
      res.status(500).json("Error processing image");
    }
  });

  return router;
};
