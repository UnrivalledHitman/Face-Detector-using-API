const express = require("express");

const router = express.Router();

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 10000;

const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isBlockedHostname = (hostname) => {
  const normalized = String(hostname || "").toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  );
};

router.post("/", async (req, res) => {
  const url = String(req.body?.url || "").trim();

  if (!isHttpUrl(url)) {
    return res.status(400).json("A valid http/https image URL is required");
  }

  const parsedUrl = new URL(url);
  if (isBlockedHostname(parsedUrl.hostname)) {
    return res.status(400).json("This host is not allowed");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });

    if (!upstream.ok) {
      return res.status(400).json("Could not download the image URL");
    }

    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return res.status(400).json("The provided URL did not return an image");
    }

    const contentLengthHeader = upstream.headers.get("content-length");
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);
      if (!Number.isNaN(contentLength) && contentLength > MAX_IMAGE_BYTES) {
        return res
          .status(413)
          .json("Image is too large. Try an image smaller than 25MB.");
      }
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return res
        .status(413)
        .json("Image is too large. Try an image smaller than 25MB.");
    }

    const dataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
    return res.json({ dataUrl });
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json("Timed out while downloading image");
    }
    console.error(err);
    return res.status(500).json("Could not proxy image URL");
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;
