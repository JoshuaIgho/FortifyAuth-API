import { FileNode } from '../types';

export const folderStructureData: FileNode = {
  name: 'fortify-auth-service',
  type: 'folder',
  path: '/',
  description:
    'FortifyAuth project root housing typescript, docker configs, database configuration and swagger docs.',
  children: [
    {
      name: 'prisma',
      type: 'folder',
      path: '/prisma',
      description: 'Prisma ORM database schema and migrations setup root.',
      children: [
        {
          name: 'schema.prisma',
          type: 'file',
          path: '/prisma/schema.prisma',
          description: 'Prisma database model definitions & relationships.',
          codeSample: `// prisma/schema.prisma
// Contained in the "Database Schema" section, click tab above to view the complete production-grade schema.`,
        },
      ],
    },
    {
      name: 'src',
      type: 'folder',
      path: '/src',
      description: 'The core source engine code root.',
      children: [
        {
          name: 'config',
          type: 'folder',
          path: '/src/config',
          description: 'Global immutable environment configuration loaders.',
          children: [
            {
              name: 'env.ts',
              type: 'file',
              path: '/src/config/env.ts',
              description:
                'Strict typing and validation schema for environment variables using Zod.',
              codeSample: `import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string().email(),
  APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
export type EnvType = z.infer<typeof envSchema>;`,
            },
            {
              name: 'redis.ts',
              type: 'file',
              path: '/src/config/redis.ts',
              description: 'Redis client connection instantiator.',
              codeSample: `import Redis from 'ioredis';
import { env } from './env';

// Initialize Redis Client securely
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true
});

redis.on('connect', () => console.log('Redis connected successfully'));
redis.on('error', (err) => console.error('Redis connection failure:', err));`,
            },
          ],
        },
        {
          name: 'middlewares',
          type: 'folder',
          path: '/src/middlewares',
          description:
            'Request filters, rate-limit boundaries, CORS protocols and schema validators.',
          children: [
            {
              name: 'auth.middleware.ts',
              type: 'file',
              path: '/src/middlewares/auth.middleware.ts',
              description:
                'Validates short-lived authorization JWT headers and injects user profile into context.',
              codeSample: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface DecodedToken {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid or malformed authentication token.' });
  }
}

export function authorize(roles: ('USER' | 'ADMIN')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden. Insufficient clearance.' });
    }
    next();
  };
}`,
            },
            {
              name: 'rateLimit.ts',
              type: 'file',
              path: '/src/middlewares/rateLimit.ts',
              description:
                'Redis-backed granular sliding-window rate-limiter safeguarding endpoints against brute force and credential stuffing.',
              codeSample: `import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
  errorMessage: string;
}

export function createRateLimiter(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // ID rate limits uniquely by IP address, fallback to user id if logged in
    const identifier = req.user?.userId || req.ip || 'anonymous';
    const redisKey = \`rate_limit:\${req.path}:\${identifier}\`;

    try {
      const now = Date.now();
      const clearBefore = now - (config.windowSeconds * 1000);

      // Perform transaction via Redis Multi to prevent race conditions
      const multi = redis.multi();
      multi.zremrangebyscore(redisKey, 0, clearBefore); // Clear outdated requests
      multi.zcard(redisKey); // Count current requests in window
      multi.zadd(redisKey, now, now.toString()); // Log current hit
      multi.expire(redisKey, config.windowSeconds); // Maintain cache lifetime TTL
      
      const results = await multi.exec();
      if (!results) {
        return next();
      }

      const requestCount = results[1][1] as number;

      if (requestCount >= config.maxRequests) {
        res.setHeader('Retry-After', config.windowSeconds);
        return res.status(429).json({
          error: config.errorMessage,
          retryAfterSeconds: config.windowSeconds
        });
      }

      next();
    } catch (err) {
      // Graceful degradation: if Redis fails in production, do not block users. Call next().
      console.error('Rate Limiter failed:', err);
      next();
    }
  };
}`,
            },
            {
              name: 'validate.ts',
              type: 'file',
              path: '/src/middlewares/validate.ts',
              description: 'Zod-powered JSON payload validator middleware.',
              codeSample: `import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Input validation failed.',
          details: error.errors.map(err => ({
            field: err.path.slice(1).join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};`,
            },
          ],
        },
        {
          name: 'services',
          type: 'folder',
          path: '/src/services',
          description:
            'Business logic layers handling DB interactions, token signatures, and email transmissions.',
          children: [
            {
              name: 'token.service.ts',
              type: 'file',
              path: '/src/services/token.service.ts',
              description:
                'Core logic for JWT tokens and secure database Refresh Token Rotation with Breach Detection capabilities.',
              codeSample: `import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

const prisma = new PrismaClient();

export class TokenService {
  /**
   * Encodes simple state payload in brief Access Token (JWT)
   */
  public static generateAccessToken(user: { id: string; email: string; role: 'USER' | 'ADMIN' }): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY }
    );
  }

  /**
   * Issues opaque db-backed Refresh Token pairs. 
   * Includes breach detection: if a token has already been revoked, it suggests 
   * the token was leaked and replayed. Automatically invalidates user sessions immediately!
   */
  public static async rotateRefreshToken(
    providedOpaqueToken: string,
    ipAddress: string,
    userAgent: string
  ) {
    const rawProvidedHash = crypto.createHash('sha256').update(providedOpaqueToken).digest('hex');

    // Look up token state and hierarchy chain
    const existingRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash: rawProvidedHash },
      include: { user: true }
    });

    if (!existingRecord) {
      throw new Error('Refresh token is invalid or inactive');
    }

    const { userId, user } = existingRecord;

    // BREACH DETECTION! If the provided token has previously been marked as revoked:
    if (existingRecord.revokedAt) {
      console.warn(\`SECURITY ALARM: Revoked RefreshToken replayed for User \${userId}! Inactivating all user sessions.\`);
      
      // Nuclear Option: Invalidate EVERY active session/refresh token for this compromised user
      await prisma.$transaction([
        prisma.refreshToken.deleteMany({ where: { userId } }),
        prisma.session.deleteMany({ where: { userId } })
      ]);

      throw new Error('Breach detected: Unauthorized token reuse attempted. Force re-authentication.');
    }

    // Check expiration constraints
    if (existingRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: existingRecord.id } });
      throw new Error('Token expired. Please login again.');
    }

    // Standard valid rotation scenario:
    const newPlaintextToken = crypto.randomBytes(40).toString('hex');
    const newHash = crypto.createHash('sha256').update(newPlaintextToken).digest('hex');
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days

    // Execute atomic rotation inside transaction
    await prisma.$transaction([
      // 1. Invalidate current token by flagging revoked state and tracking replacement
      prisma.refreshToken.update({
        where: { id: existingRecord.id },
        data: {
          revokedAt: new Date(),
          replacedBy: newHash
        }
      }),
      // 2. Spawn next fresh rotation token in chain
      prisma.refreshToken.create({
        data: {
          userId,
          tokenHash: newHash,
          expiresAt: newExpiry
        }
      })
    ]);

    // Issue refreshed stateless access token
    const newAccessToken = this.generateAccessToken(user as any);

    return {
      accessToken: newAccessToken,
      refreshToken: newPlaintextToken,
      expiresInSeconds: 900 // 15 Minutes
    };
  }
}`,
            },
            {
              name: 'email.service.ts',
              type: 'file',
              path: '/src/services/email.service.ts',
              description: 'Emails Dispatcher wrapper utilizing Nodemailer backend.',
              codeSample: `import nodemailer from 'nodemailer';
import { env } from '../config/env';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  public static async sendVerificationEmail(email: z.string, token: string): Promise<void> {
    const url = \`\${env.APP_URL}/verify-email?token=\${token}\`;
    
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Verify your FortifyAuth registration',
      html: \`
        <h2>Welcome to FortifyAuth!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="\${url}" style="background-color: #2563eb; color: white; padding: 10px 18px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email Address</a></p>
        <p>This verification link expires in 24 hours.</p>
      \`
    });
  }

  public static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const url = \`\${env.APP_URL}/reset-password?token=\${token}\`;

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Reset your FortifyAuth Password',
      html: \`
        <h2>Password Reset Request</h2>
        <p>We received request to reset your password. If you didn't initiate this, ignore this email.</p>
        <p><a href="\${url}" style="background-color: #dc2626; color: white; padding: 10px 18px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
        <p>This recovery token expires in 1 hour.</p>
      \`
    });
  }
}`,
            },
          ],
        },
      ],
    },
  ],
};
