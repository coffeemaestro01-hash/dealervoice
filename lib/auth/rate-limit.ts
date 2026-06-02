import { redis, CACHE_KEYS } from "@/lib/redis";
import { NextRequest } from "next/server";

interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  review_submit: { limit: 5, windowSeconds: 3600 },
  auth_attempt: { limit: 10, windowSeconds: 900 },
  api_general: { limit: 100, windowSeconds: 60 },
  search: { limit: 60, windowSeconds: 60 },
  upload: { limit: 20, windowSeconds: 3600 },
};

export async function rateLimit(
  req: NextRequest,
  action: keyof typeof RATE_LIMITS
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown";
  const config = RATE_LIMITS[action];
  const key = CACHE_KEYS.rateLimit(ip, action);

  if (!redis) {
    // No Redis - allow all requests (deploy behind Vercel/Cloudflare rate limiting instead)
    return { success: true, remaining: config.limit, resetAt: Date.now() + config.windowSeconds * 1000 };
  }
  try {
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, config.windowSeconds);
    const ttl = await redis.ttl(key);
    const remaining = Math.max(0, config.limit - current);
    return { success: current <= config.limit, remaining, resetAt: Date.now() + ttl * 1000 };
  } catch {
    return { success: true, remaining: config.limit, resetAt: Date.now() + config.windowSeconds * 1000 };
  }
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
