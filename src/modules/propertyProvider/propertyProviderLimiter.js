import { ipKeyGenerator } from "express-rate-limit";

const MAX_FREE_ATTEMPTS = 5;            // wrong passwords allowed before the first lockout
const BASE_LOCK_MS = 60 * 1000;         // first lockout: 1 minute, then doubles each time
const MAX_LOCK_MS = 24 * 60 * 60 * 1000; // lockout never exceeds 24 hours
const FORGET_AFTER_MS = 24 * 60 * 60 * 1000; // clear the record after 24h without a failure

const attempts = new Map(); // key -> { fails, lockUntil, lastFail }

// remove old records so the map doesn't grow forever
setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of attempts) {
    if (rec.lockUntil < now && now - rec.lastFail > FORGET_AFTER_MS) attempts.delete(key);
  }
}, 10 * 60 * 1000).unref();

const getKey = (req) => {
  const ip = ipKeyGenerator(req.ip);
  const email = String(req.body?.email || "").trim().toLowerCase();
  return email ? `${ip}:${email}` : ip;
};

const formatWait = (ms) => {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds} second(s)`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minute(s)`;
  return `${Math.ceil(seconds / 3600)} hour(s)`;
};

export const loginLimiter = (req, res, next) => {
  const key = getKey(req);
  const now = Date.now();
  const rec = attempts.get(key);

  // still locked: block before the controller runs
  if (rec && rec.lockUntil > now) {
    const waitMs = rec.lockUntil - now;
    res.set("Retry-After", String(Math.ceil(waitMs / 1000)));
    return res.status(429).json({
      success: false,
      message: `Too many failed login attempts. Try again in ${formatWait(waitMs)}.`,
    });
  }

  // after the controller answers, count the result
  res.on("finish", () => {
    const time = Date.now();

    if (res.statusCode < 400) {
      attempts.delete(key); // successful login resets everything
      return;
    }

    if (res.statusCode !== 401) return; // only wrong credentials count

    const current = attempts.get(key) ?? { fails: 0, lockUntil: 0, lastFail: 0 };
    if (time - current.lastFail > FORGET_AFTER_MS) current.fails = 0;

    current.fails += 1;
    current.lastFail = time;

    if (current.fails >= MAX_FREE_ATTEMPTS) {
      const exponent = current.fails - MAX_FREE_ATTEMPTS;
      const lockMs = Math.min(BASE_LOCK_MS * 2 ** exponent, MAX_LOCK_MS);
      current.lockUntil = time + lockMs;
    }

    attempts.set(key, current);
  });

  next();
};

export const propertyProviderLimiter = loginLimiter; // keeps your old imports working
/*import rateLimit, { ipKeyGenerator } from "express-rate-limit";

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

export const propertyProviderLimiter = loginLimiter; // keeps my old imports working*/
