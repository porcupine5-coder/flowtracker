import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Global fixed window limit
  freeTrialSignUp: { kind: "fixed window", rate: 100, period: HOUR },
  // Per-user token bucket limit with burst capacity
  sendMessage: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 3 },
  // High-throughput limit with sharding
  llmTokens: { kind: "token bucket", rate: 40000, period: MINUTE, shards: 10 },
});
