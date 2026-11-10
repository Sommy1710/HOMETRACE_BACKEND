
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip);
    const email = String(req.body?.email || "").trim().toLowerCase();
    return email ? `${ip}:${email}` : ip;
  },
  handler: (req, res, next, options) => {
    const resetTime = req.rateLimit?.resetTime?.getTime() ?? Date.now() + options.windowMs;
    const seconds = Math.max(Math.ceil((resetTime - Date.now()) / 1000), 1);
    res.set("Retry-After", String(seconds));
    res.status(429).json({
      success: false,
      message: `Too many login attempts. Try again in ${Math.ceil(seconds / 60)} minute(s).`,
    });
  },
});

export const userlimiter = loginLimiter; // keeps my old imports working
