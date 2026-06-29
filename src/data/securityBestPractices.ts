import { SecurityCheckItem } from '../types';

export const securityItemsList: SecurityCheckItem[] = [
  {
    id: 'sec-argon2',
    title: 'Password Hashing with Argon2id',
    category: 'Cryptography',
    severity: 'CRITICAL',
    vulnerability:
      'Weak or fast hashing algorithms (MD5, SHA256, BCrypt with low cost) are vulnerable to high-speed offline GPU brute-force calculation.',
    bestPractice:
      'Always use Argon2id (specifically argon2id profile, not argon2i or argon2d) which is memory-hard, time-hard, and parallel-hard.',
    codeSnippet: `import argon2 from 'argon2';

// Standard OWASP recommended Argon2id parameters
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id, // Argon2id profile
    memoryCost: 65536,     // 64 MB memory
    timeCost: 3,           // 3 iterations
    parallelism: 4,        // 4 threads
    saltLength: 16         // 16 bytes cryptorandom salt
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}`,
  },
  {
    id: 'sec-cookie',
    title: 'Secure httpOnly Refresh Token Cookies',
    category: 'Session',
    severity: 'CRITICAL',
    vulnerability:
      'Storing Refresh Tokens in localStorage makes them completely vulnerable to direct exfiltration via Cross-Site Scripting (XSS) malware injects.',
    bestPractice:
      'Always set Refresh Tokens inside cookies flagging HttpOnly, Secure, SameSite=Strict and Path constraints.',
    codeSnippet: `// Express response configuration
res.cookie('refreshToken', plainRefreshToken, {
  httpOnly: true,                 // Block javascript exfiltration (XSS)
  secure: true,                   // Send only over HTTPS
  sameSite: 'strict',             // Avoid cross-site CSRF injection leaks
  path: '/api/v1/auth/refresh',   // Send cookie ONLY to refresh route (minimize exposure)
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days lifespan
});`,
  },
  {
    id: 'sec-rotation',
    title: 'Refresh Token Rotation & Breach Detection',
    category: 'Session',
    severity: 'CRITICAL',
    vulnerability:
      'If an operator exfiltrates a refresh token, they obtain silent, continuous api access indefinitely.',
    bestPractice:
      'During token refresh, invalidate both access/refresh tokens, emit a brand new pair, and structure parent-replacement relationships. If a previous invalid token is re-submitted, detect a breach and terminate all user sessions immediately.',
    codeSnippet: `// Inside Token rotation logic:
if (existingRecord.revokedAt) {
  // CRITICAL breach alert! This suggests token has been replayed by an intruder.
  console.warn("BREACH DETECTED: Invalid/previously rotated Refresh Token was submitted!");
  
  // Revoke all tokens for user immediately
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  throw new Error("Potential session hijack detected. Please log in again.");
}`,
  },
  {
    id: 'sec-xss',
    title: 'Defensive HTTP headers with Helmet.js',
    category: 'Network',
    severity: 'HIGH',
    vulnerability:
      'Absence of defensive headers permits Iframe clickjacking, mime sniffing, cross-site leaks, and missing SSL enforcement.',
    bestPractice:
      'Implement Helmet middleware. Force HTTP Strict Transport Security (HSTS) and a robust Content Security Policy (CSP).',
    codeSnippet: `import helmet from 'helmet';
import express from 'express';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      frameAncestors: ["'none'"] // Anti Clickjacking
    }
  },
  referrerPolicy: { policy: 'same-origin' },
  xssFilter: true,
  noSniff: true
}));`,
  },
  {
    id: 'sec-ratelimit',
    title: 'Granular API Rate Limiting',
    category: 'Network',
    severity: 'HIGH',
    vulnerability:
      'Uncapped public routers are highly vulnerable to credential stuffing bots, DOS volume dumps, and brute-force password guessing.',
    bestPractice:
      'Enforce distinct sliding-window limits using memory or cache stores: strict caps on authorization attempt paths (e.g. 5 attempts per IP per 10 mins) and generous caps for general routes.',
    codeSnippet: `import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // IP capped to 5 requests per 15m for critical paths
  message: { error: 'Too many authentication attempts. Please retry in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});`,
  },
  {
    id: 'sec-dbhash',
    title: 'One-Way Hash on Database Tokens',
    category: 'Database',
    severity: 'CRITICAL',
    vulnerability:
      'Storing raw, plaintext refresh and recovery tokens exposes the system to active takeover if the database is read-compromised via SQLi or dump files.',
    bestPractice:
      'Never store plain tokens in databases. Always write the SHA-256 hash representation of the token in records; validate queries by hashing incoming payload parameters to lookup rows.',
    codeSnippet: `import crypto from 'crypto';

// Token generation:
const plaintextToken = crypto.randomBytes(40).toString('hex');
// Hash calculation for DB storage:
const dbTokenHash = crypto.createHash('sha256').update(plaintextToken).digest('hex');

// Look up validation:
const incomingHash = crypto.createHash('sha256').update(req.body.token).digest('hex');
const record = await prisma.refreshToken.findUnique({
  where: { tokenHash: incomingHash }
});`,
  },
  {
    id: 'sec-sanitize',
    title: 'Sterilizing Log Sanitization templates',
    category: 'Logging',
    severity: 'MEDIUM',
    vulnerability:
      'Logging plaintext raw request payloads can accidentally write sensitive passwords, OTPs, recovery links, or headers to storage files.',
    bestPractice:
      'Enforce custom express middleware that parses request bodies and sterilizes passwords or authorization parameters before writing logs.',
    codeSnippet: `export function sanitizePayloadForLogs(payload: any) {
  const sanitized = { ...payload };
  const sensitiveKeys = ['password', 'newPassword', 'oldPassword', 'token', 'authorization'];
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED_CRITICAL_PARAMETER]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizePayloadForLogs(sanitized[key]); // Recursion helper
    }
  }
  return sanitized;
}`,
  },
];
