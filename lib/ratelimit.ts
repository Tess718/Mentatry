import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

class MemoryRatelimit {
  private requests: Map<string, number[]> = new Map();

  async limit(identifier: string) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes window
    const maxRequests = 20; // 20 requests per window

    const timestamps = this.requests.get(identifier) || [];
    const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

    if (validTimestamps.length >= maxRequests) {
      return { success: false, reset: now + windowMs, limit: maxRequests, remaining: 0 };
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);
    return {
      success: true,
      reset: now + windowMs,
      limit: maxRequests,
      remaining: maxRequests - validTimestamps.length,
    };
  }
}

export const quizRatelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(20, "15 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/mentatry",
    })
  : new MemoryRatelimit();

export const authRatelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/auth",
    })
  : new MemoryRatelimit();
