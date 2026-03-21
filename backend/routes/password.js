const express = require("express");
const crypto = require("crypto");
const argon2 = require("argon2");
const { Resend } = require("resend");
const db = require("../db");

const router = express.Router();
const forgotRateLimitStore = new Map();

const FORGOT_WINDOW_MS = 15 * 60 * 1000;
const FORGOT_MAX_ATTEMPTS = 5;

function buildResetUrl(token) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const base = frontendUrl.endsWith("/")
    ? frontendUrl.slice(0, -1)
    : frontendUrl;
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
}

function forgotPasswordRateLimit(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const now = Date.now();
  const windowStart = now - FORGOT_WINDOW_MS;

  const attempts = (forgotRateLimitStore.get(ip) || []).filter(
    (timestamp) => timestamp > windowStart,
  );

  if (attempts.length >= FORGOT_MAX_ATTEMPTS) {
    return res
      .status(429)
      .json("Too many password reset attempts. Please try again later.");
  }

  attempts.push(now);
  forgotRateLimitStore.set(ip, attempts);
  return next();
}

router.post("/forgot", forgotPasswordRateLimit, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json("Email is required");
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return res
      .status(500)
      .json("Password reset email service is not configured");
  }

  try {
    const user = await db.user.findFirst({
      where: {
        email: { equals: email.toLowerCase().trim(), mode: "insensitive" },
      },
    });

    // Return generic response to avoid exposing whether an email exists.
    if (!user) {
      return res.json("If this email exists, a reset link has been sent.");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
      });

      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const resetUrl = buildResetUrl(token);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: user.email,
      subject: "Reset your Face Detector password",
      html: `<p>You requested a password reset.</p>
             <p>Use the link below to set a new password (expires in 1 hour):</p>
             <p><a href=\"${resetUrl}\">Reset password</a></p>
             <p>If you did not request this, you can ignore this email.</p>`,
    });

    return res.json("If this email exists, a reset link has been sent.");
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error sending reset email");
  }
});

router.post("/reset", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json("Token and new password are required");
  }

  if (password.length < 8) {
    return res.status(400).json("Password must be at least 8 characters");
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetRow = await db.passwordResetToken.findFirst({
      where: {
        tokenHash,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRow) {
      return res.status(400).json("Reset token is invalid or expired");
    }

    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    await db.$transaction(async (tx) => {
      await tx.login.update({
        where: { id: resetRow.userId },
        data: { hash },
      });
      await tx.passwordResetToken.update({
        where: { id: resetRow.id },
        data: { used: true },
      });
    });

    return res.json("Password updated successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error resetting password");
  }
});

module.exports = router;
