import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import type { Request, Response, NextFunction } from "express";

// OWASP's 16 MiB profile uses p=5. Encode the work factors so future upgrades
// can migrate hashes at sign-in without resetting existing users' passwords.
const scrypt = (password: string, salt: string, legacy = false) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      64,
      { N: 16384, r: 8, p: legacy ? 1 : 5, maxmem: 32 * 1024 * 1024 },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
  });
export const DUMMY_PASSWORD_HASH = `scrypt:16384:8:5:${"0".repeat(32)}:${"0".repeat(128)}`;
export const token = () => randomBytes(32).toString("base64url");
export const hashToken = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt);
  return `scrypt:16384:8:5:${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(
  password: string,
  encoded: string,
): Promise<boolean> {
  const parts = encoded.split(":");
  const legacy = parts.length === 3;
  if (
    parts[0] !== "scrypt" ||
    (!legacy &&
      (parts.length !== 6 || parts.slice(1, 4).join(":") !== "16384:8:5"))
  )
    return false;
  const [salt, stored] = parts.slice(-2);
  if (!/^[0-9a-f]{32}$/.test(salt) || !/^[0-9a-f]{128}$/.test(stored))
    return false;
  const hash = await scrypt(password, salt, legacy);
  const expected = Buffer.from(stored, "hex");
  return expected.length === hash.length && timingSafeEqual(expected, hash);
}
export function constantEqual(a: string, b: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export const fail = (status: number, code: string, message: string): never => {
  throw new HttpError(status, code, message);
};
export function rateLimit(
  max: number,
  interval: number,
  key: (request: Request) => string = (request) => request.ip ?? "unknown",
) {
  const attempts = new Map<string, { count: number; until: number }>();
  let sweepAt = 0;
  return (request: Request, response: Response, next: NextFunction) => {
    const now = Date.now();
    if (now >= sweepAt) {
      for (const [id, value] of attempts)
        if (value.until < now) attempts.delete(id);
      sweepAt = now + interval;
    }
    const id = key(request);
    const entry = attempts.get(id);
    const current =
      entry && entry.until > now ? entry : { count: 0, until: now + interval };
    current.count += 1;
    attempts.set(id, current);
    if (current.count > max) {
      response.setHeader(
        "Retry-After",
        Math.ceil((current.until - now) / 1000),
      );
      response.status(429).json({
        error: "Too many requests. Try again shortly.",
        code: "RATE_LIMITED",
      });
    } else next();
  };
}
