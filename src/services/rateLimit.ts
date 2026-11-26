export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

interface BucketEntry {
  timestamps: number[];
}

const MAX_LOCAL_BUCKETS = 10_000;
const localBuckets = new Map<string, BucketEntry>();

function pruneLocalBuckets(now: number, windowMs: number) {
  if (localBuckets.size <= MAX_LOCAL_BUCKETS) return;
  for (const [key, entry] of localBuckets.entries()) {
    const valid = entry.timestamps.filter((ts) => now - ts < windowMs);
    if (valid.length === 0) {
      localBuckets.delete(key);
    } else {
      entry.timestamps = valid;
    }
    if (localBuckets.size <= MAX_LOCAL_BUCKETS * 0.8) break;
  }
}

async function checkUpstashRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const key = `eastfield:ratelimit:${identifier}`;
  const now = Date.now();

  try {
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSeconds, "NX"],
        ["TTL", key],
      ]),
      cache: "no-store",
    });

    if (!response.ok) return null;
    const data = (await response.json()) as Array<{ result?: number }>;
    const count = Number(data[0]?.result ?? 1);
    const ttl = Number(data[2]?.result ?? windowSeconds);

    return {
      allowed: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetAt: now + Math.max(1, ttl) * 1000,
    };
  } catch {
    return null;
  }
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const limit = Math.max(1, Number(process.env.RATE_LIMIT_MAX_REQUESTS || 8));
  const windowSeconds = Math.max(60, Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 900));
  const windowMs = windowSeconds * 1000;

  const distributed = await checkUpstashRateLimit(identifier, limit, windowSeconds);
  if (distributed) return distributed;

  const now = Date.now();
  pruneLocalBuckets(now, windowMs);

  const entry = localBuckets.get(identifier) ?? { timestamps: [] };
  const recent = entry.timestamps.filter((ts) => now - ts < windowMs);

  if (recent.length >= limit) {
    const oldest = recent[0] ?? now;
    localBuckets.set(identifier, { timestamps: recent });
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: oldest + windowMs,
    };
  }

  recent.push(now);
  localBuckets.set(identifier, { timestamps: recent });

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - recent.length),
    resetAt: now + windowMs,
  };
}

export function clearLocalRateLimitBuckets() {
  localBuckets.clear();
}
