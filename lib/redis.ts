import { Redis } from "@upstash/redis";

// Check for required environment variables before instantiating to avoid
// silent failures or opaque errors in production/serverless environments.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null; // Fallback to null if not configured, handle gracefully where used
