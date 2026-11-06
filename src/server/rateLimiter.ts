import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private requests: Map<string, RateLimitRecord> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodic cleanup of expired records every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.requests.entries()) {
        if (now > record.resetTime) {
          this.requests.delete(key);
        }
      }
    }, 300000);
  }

  public middleware(customMax?: number) {
    const limit = customMax || this.maxRequests;
    return (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `${ip}:${req.baseUrl || req.path}`;
      const now = Date.now();

      let record = this.requests.get(key);
      if (!record || now > record.resetTime) {
        record = { count: 1, resetTime: now + this.windowMs };
        this.requests.set(key, record);
        return next();
      }

      record.count += 1;
      if (record.count > limit) {
        res.status(429).json({
          error: 'تعداد درخواست‌های ارسالی بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.'
        });
        return;
      }

      next();
    };
  }
}

// Strict limiter for authentication (max 10 attempts per minute to prevent brute-force)
export const authLimiter = new RateLimiter(60000, 10);
// General API limiter (max 100 requests per minute)
export const generalLimiter = new RateLimiter(60000, 100);
