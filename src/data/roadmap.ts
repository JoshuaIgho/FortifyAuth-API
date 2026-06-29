import { RoadmapPhase } from '../types';

export const roadmapPhases: RoadmapPhase[] = [
  {
    phase: 1,
    title: 'Foundation, ORM & Environment Setup',
    duration: 'Week 1',
    description:
      'Establish codebase foundation, managed databases, migrations, and schema validation.',
    tasks: [
      {
        title: 'Secure Environment Parsing',
        desc: 'Implement strict Zod environment variables validator config (env.ts).',
        completedByDefault: true,
      },
      {
        title: 'Relational Database Migrations',
        desc: 'Initialize standard PostgreSQL and specify the schema.prisma file structures.',
        completedByDefault: true,
      },
      {
        title: 'Docker Orchestration Configs',
        desc: 'Boot dependencies (PostgreSQL, Redis dev server) using external managed services.',
        completedByDefault: true,
      },
      {
        title: 'Express Scaffolding with TypeScript',
        desc: 'Establish core App routers, logging modules, and global custom error capture systems.',
        completedByDefault: true,
      },
    ],
    deliverables: [
      'Validated config.json/.env parameters',
      'Prisma client schema migration files',
      'Running local cluster (Redis + Postgres)',
    ],
  },
  {
    phase: 2,
    title: 'Core Cryptography & Authentication flows',
    duration: 'Week 2',
    description:
      'Secure registration path, password strength validators, Argon2id encryption, and transactional verification mailers.',
    tasks: [
      {
        title: 'Create Registration API Endpoint',
        desc: 'Implement schema sanitization, validation validators, and check for unique email existence.',
        completedByDefault: false,
      },
      {
        title: 'Integrate Argon2id Password Crypt',
        desc: 'Implement memory-hard parallel crypt hashing for store-writes and validation.',
        completedByDefault: false,
      },
      {
        title: 'Email Token Verification Ticketing',
        desc: 'Configure SMTP credentials and design transactional layouts for verifying registration emails.',
        completedByDefault: false,
      },
      {
        title: 'Audit Log Registry',
        desc: 'Store registration event histories (IP geo, Browser agent, email targets) inside AuditLog schema.',
        completedByDefault: false,
      },
    ],
    deliverables: [
      'POST /auth/register router API',
      'Argon2 password hash verifying utility tools',
      'Verification email send queues in task runners',
    ],
  },
  {
    phase: 3,
    title: 'Dual-Tier Token Engine & Refresh Rotation',
    duration: 'Week 3',
    description:
      'Implement secure Bearer JWT token issuance, Redis session tracking, httpOnly rotation pairs, and state-compromise breach checks.',
    tasks: [
      {
        title: 'Implement Credentials Verification Login',
        desc: 'Confirm verified state profiles, match Argon2id hashes, verify account permissions flags.',
        completedByDefault: false,
      },
      {
        title: 'Failsafe Session Token Rotation',
        desc: 'Form secure opaque refresh tokens, hash database entries, and clear previous tokens inside transactions.',
        completedByDefault: false,
      },
      {
        title: 'Refresh Token Hijack Alarm',
        desc: 'Implement conditional blocks targeting replayed refresh tokens; trigger full security session revoking.',
        completedByDefault: false,
      },
      {
        title: 'Register Login History logs',
        desc: 'Write database history records logging success flags, fail counts, IP and user agent headers.',
        completedByDefault: false,
      },
    ],
    deliverables: [
      'POST /auth/login & POST /auth/refresh robust routers',
      'Refresh Token Rotation and Compromise Tracing mechanism',
      'Secure Cookie parameters configuration',
    ],
  },
  {
    phase: 4,
    title: 'Fast Recovery & Validation Handshakes',
    duration: 'Week 4',
    description:
      'Implement forgot/reset password OTP ticketing, fast duration tracking, and state verification APIs.',
    tasks: [
      {
        title: 'Expose Request Recovery Mail API',
        desc: "Unregistered accounts enumeration defense: mask server responses so system doesn't disclose user presence.",
        completedByDefault: false,
      },
      {
        title: 'Password Reset tokens storage',
        desc: 'Store SHA-256 hashed recovery tickets with extremely brief lifespan criteria (maximum 1h).',
        completedByDefault: false,
      },
      {
        title: 'Update Passwords in database',
        desc: 'Expose PATCH/POST /reset-password endpoint validating ticket codes and writing secure new Argon2id password hashes.',
        completedByDefault: false,
      },
      {
        title: 'Registration Completion Verify API',
        desc: 'Implement POST /verify-email endpoint, transitioning account isEmailVerified true.',
        completedByDefault: false,
      },
    ],
    deliverables: [
      'POST /auth/forgot-password & /reset-password endpoint paths',
      'Hashed brief-expiry recovery records in Postgres',
      'Generic success responder outputs preventing information disclosure leaks',
    ],
  },
  {
    phase: 5,
    title: 'Network Barriers, Limiters & Privileges (RBAC)',
    duration: 'Week 5',
    description:
      'Enforce security middleware limits, CORS, secure headers, and access route guard roles authorization.',
    tasks: [
      {
        title: 'Redis Rate Limiting Middleware',
        desc: 'Implement sliding window Redis controllers restricting brute force loops (e.g., 5 calls per 15 minutes).',
        completedByDefault: false,
      },
      {
        title: 'Secure HTTP Headers (Helmet)',
        desc: 'Mount Helmet in Express app configuration, stripping X-Powered-By and framing CSP guides.',
        completedByDefault: false,
      },
      {
        title: 'Cross-Origin Resource Sharing',
        desc: 'Apply narrow CORS list white-listing matching registered client domains.',
        completedByDefault: false,
      },
      {
        title: 'Role-Based Access Control Middlewares',
        desc: 'Expose authorization middlewares reading roles inside verified access tokens (USER, ADMIN).',
        completedByDefault: false,
      },
    ],
    deliverables: [
      'Redis cluster Sliding-Window Limiters',
      'Helmet and Strict Cors Express filters',
      'Role authorizations routes middlewares (e.g. authorize(["ADMIN"]))',
    ],
  },
  {
    phase: 6,
    title: 'Swagger Documentation & Production Deploy Specs',
    duration: 'Week 6',
    description:
      'Generate standardized Swagger definitions, complete comprehensive security audit traces, and design production VPC and scaling guides.',
    tasks: [
      {
        title: 'Swagger Specs Documentation',
        desc: 'Implement swagger-jsdoc alongside swagger-ui-express to serve live API specs under /docs.',
        completedByDefault: false,
      },
      {
        title: 'VPC private subnetting configs',
        desc: 'Form production setups isolating application cluster in private VPC subnets behind load balancer.',
        completedByDefault: false,
      },
      {
        title: 'Production Multi-AZ Scaling',
        desc: 'Setup container orchestrator files, scale containers horizontally, configure volume backups.',
        completedByDefault: false,
      },
    ],
    deliverables: [
      'Online OpenAPI/Swagger Explorer under http://localhost:3000/docs',
      'Highly structured logs (Sanitized logs)',
      'High Availability Multi-Region deployment blueprint',
    ],
  },
];
