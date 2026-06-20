# FortifyAuth API Rate Limiting Policies

To protect computational infrastructure against DDoS attempts, password cracking dictionary runs, and automated script attacks, FortifyAuth enforces strict rate-limiting policies at the API gateway layer.

---

## 1. Rate Limiting Profiles

| Route Group | Window | Max Request Limit | Action on Violation |
| :--- | :--- | :--- | :--- |
| **Public Auth Endpoints**<br>`/api/v1/auth/login`<br>`/api/v1/auth/register` | 1 Minute | 5 Attempts | Lock connection IP for 15 minutes. Log event inside security threat trackers. |
| **Standard Core API**<br>`/api/v1/*` | 1 Minute | 100 Requests | Reject connections with `429 Too Many Requests`. |
| **Developer API Keys** | 1 Minute | 1000 Requests | Reject connections with `429 Too Many Requests`. |

---

## 2. Sliding Window Log Algorithm (Redis Implementation)

We utilize Redis sorted sets (`ZSET`) to record connection timestamps with millisecond accuracy. This avoids edge-case rate limit bypasses.

```typescript
// rateLimiter.ts
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../lib/redis';

export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const key = `rate:${req.baseUrl}:${ip}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxLimit = 100;

  const redis = getRedisClient();

  try {
    const multi = redis.multi();
    multi.zremrangebyscore(key, 0, now - windowMs); // Erase records outside active window
    multi.zadd(key, now, String(now));             // Log active request timestamp
    multi.zcard(key);                               // Get active bucket size
    multi.expire(key, 60);

    const execResults = await multi.exec();
    const count = execResults ? (execResults[2][1] as number) : 0;

    if (count > maxLimit) {
      return res.status(429).json({
        success: false,
        error: 'RATE_ERR_01',
        message: 'Request volume has exceeded allowed thresholds. Rate-locked for 1 minute.',
      });
    }

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', maxLimit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxLimit - count));
    next();
  } catch (err) {
    // Fail-safe to next middleware if Redis fails
    next();
  }
}
```
*Note: In clustered environments, rate limit evaluation can be delegated to API Gateways (e.g. Kong, AWS API Gateway) to keep Express application pods focused on processing authenticated request paths.*
