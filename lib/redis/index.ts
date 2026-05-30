import Redis from "ioredis";

// Redis is optional. When REDIS_URL is absent all cache operations are no-ops.
const REDIS_ENABLED = !!process.env.REDIS_URL;

const globalForRedis = globalThis as unknown as { redis: Redis | null };

function createRedisClient(): Redis | null {
  if (!REDIS_ENABLED) return null;
  const client = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 1000);
    },
  });
  client.on("error", (err) => {
    if (process.env.NODE_ENV !== "test") console.error("Redis error:", err.message);
  });
  return client;
}

export const redis: Redis | null =
  REDIS_ENABLED ? (globalForRedis.redis ?? createRedisClient()) : null;

if (process.env.NODE_ENV !== "production" && redis) globalForRedis.redis = redis;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch { return null; }
}

export async function setCache<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  if (!redis) return;
  try { await redis.set(key, JSON.stringify(value), "EX", ttlSeconds); } catch { }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;
  try { await redis.del(key); } catch { }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch { }
}

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAY: 86400,
};

export const CACHE_KEYS = {
  dealership: (slug: string) => `dealership:${slug}`,
  dealershipReviews: (id: string, page: number) => `dealership:${id}:reviews:${page}`,
  searchResults: (query: string) => `search:${Buffer.from(query).toString("base64")}`,
  reputationScore: (id: string) => `reputation:${id}`,
  analytics: (id: string, period: string) => `analytics:${id}:${period}`,
  rateLimit: (ip: string, action: string) => `ratelimit:${action}:${ip}`,
};
