import { ArchNode } from '../types';

export const archNodes: ArchNode[] = [
  {
    id: 'client',
    label: 'Client Browser / Mobile App',
    type: 'client',
    description:
      'The frontend user interface (SPA, iOS/Android) initiating OAuth, login, and token refresh requests.',
    responsibility: [
      'Store Access Token safely in short-lived memory',
      'Securely persist Refresh Token in httpOnly, Secure, SameSite=Strict cookies',
      'Trigger silent refreshes before short-lived Access Token expires',
      'Handle unauthorized (401) states by forcing transparent token renewal or redirecting to login',
    ],
    techUsed: 'React / Swift / Kotlin with Axios / Fetch interceptors',
    configTip:
      'Avoid storing tokens in localStorage or sessionStorage to protect against Cross-Site Scripting (XSS) attacks.',
  },
  {
    id: 'gateway',
    label: 'Reverse Proxy & Rate Limiter',
    type: 'network',
    description:
      'Nginx, Cloudflare or AWS API Gateway protecting the internal microservices, performing rate limiting, and terminating SSL.',
    responsibility: [
      'Reject malicious volumetric traffic before it hits the application server',
      'SSL/TLS Termination using secure protocols (TLS 1.3)',
      'Inject standard proxy headers (X-Forwarded-For, X-Real-IP)',
      'IP-level or connection-level DDoS protection',
    ],
    techUsed: 'Nginx / Cloudflare / AWS WAF',
    configTip:
      'Configure maximum request limits, and deny requests from suspicious IP address spaces. Route traffic over private VPC.',
  },
  {
    id: 'express_app',
    label: 'FortifyAuth Server (Express.js)',
    type: 'server',
    description:
      'The main, stateless authenticating engine written in TypeScript and Express, handling routes, hash validations, JWT creation, and session management.',
    responsibility: [
      'Expose secure REST APIs with strict Input Validation via Zod / Joi',
      'Implement state-of-the-art password hashing using Argon2id',
      'Issue dual-tier token pairs: brief Access Tokens (JWT) & robust Refresh Tokens (UUIDv4/opaque db-backed)',
      'Enforce Role-Based Access Control (RBAC) rules on sensitive routes',
    ],
    techUsed: 'Express v4 / v5 + TypeScript + Argon2 + JsonWebToken',
    configTip:
      'Use a custom Global Error Handler that catch-alls errors, logs full traces internally, and returns sterile, generic warnings to users.',
  },
  {
    id: 'postgres_db',
    label: 'PostgreSQL Relational DB',
    type: 'database',
    description:
      'Core ACID-compliant database holding normalized tables for users, passwords, sessions, login logs, and audit trails.',
    responsibility: [
      'Safely store robust User records, linked refresh tokens, and system profile tables',
      'Maintain continuous Audit Logs recording critical tenant alterations (admin updates, role changes)',
      'Keep Login History trails (IP location, user-agent, timestamps) to detect credential stuffing',
    ],
    techUsed: 'PostgreSQL DB + Prisma ORM / pg client',
    configTip:
      'Index fields targeted frequently for lookup, such as User.email, Session.tokenHash, and AuditLog.userId to maximize performance.',
  },
  {
    id: 'smtp_server',
    label: 'SMTP Email Service Provider',
    type: 'external',
    description:
      'External transactional mail delivery service to dispatch password reset coordinates and registration verification pins.',
    responsibility: [
      'Securely deliver high-priority magic login links or reset buttons',
      'Dispatch immediate warnings about accounts accessed from anomalous geolocation or unrecognized browsers',
      'Track email bounces and verification state events feedback',
    ],
    techUsed: 'Nodemailer / Resend SDK / Amazon SES',
    configTip:
      'Configure SMTP with strict SPF, DKIM, and DMARC parameters on your sending domain to prevent email spoofing and ensure clean delivery.',
  },
];
