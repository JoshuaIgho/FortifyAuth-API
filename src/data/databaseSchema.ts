import { DatabaseModel } from '../types';

export const prismaSchemaCode = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum AuditAction {
  USER_REGISTERED
  EMAIL_VERIFIED
  USER_LOGIN_SUCCESS
  USER_LOGIN_FAILED
  USER_LOGOUT
  PASSWORD_RESET_REQUEST
  PASSWORD_RESET_SUCCESS
  USER_ROLE_UPDATED
  MFA_ENABLED
  MFA_DISABLED
}

model User {
  id                   String                 @id @default(uuid())
  email                String                 @unique
  passwordHash         String
  role                 Role                   @default(USER)
  isEmailVerified      Boolean                @default(false)
  createdAt            DateTime               @default(now())
  updatedAt            DateTime               @updatedAt
  
  // Relations
  sessions             Session[]
  refreshTokens        RefreshToken[]
  emailVerifications   EmailVerificationToken[]
  passwordResets       PasswordResetToken[]
  loginHistories       LoginHistory[]
  auditLogs            AuditLog[]

  @@index([email])
}

model Session {
  id           String    @id @default(uuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash    String    @unique
  userAgent    String?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime  @default(now())

  @@index([userId])
  @@index([tokenHash])
}

model RefreshToken {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash   String    @unique // Hashed token string stored in DB
  expiresAt   DateTime
  createdAt   DateTime  @default(now())
  revokedAt   DateTime?
  replacedBy  String?   // Tracks token rotation chains

  @@index([userId])
  @@index([tokenHash])
}

model EmailVerificationToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
}

model LoginHistory {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ipAddress    String
  userAgent    String
  status       Boolean  // true = success, false = failure
  failureReason String?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}

model AuditLog {
  id        String      @id @default(uuid())
  userId    String?     // Nullable for public/unauthenticated actions
  user      User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  action    AuditAction
  ipAddress String
  userAgent String
  payload   Json?       // Stores structured metadata changes (e.g., {"oldRole": "USER", "newRole": "ADMIN"})
  createdAt DateTime    @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}`;

export const dbModels: DatabaseModel[] = [
  {
    name: 'User',
    description: 'System-wide accounts registering to use FortifyAuth. Core identity profile.',
    fields: [
      {
        name: 'id',
        type: 'String (UUID)',
        isPrimary: true,
        description: 'Unique identity system primary key.',
      },
      {
        name: 'email',
        type: 'String',
        isUnique: true,
        description: 'User-specified email address. Lowercased to avoid duplicates.',
      },
      {
        name: 'passwordHash',
        type: 'String',
        description: 'Argon2id robust irreversible cryptographic digest.',
      },
      { name: 'role', type: 'Enum (USER, ADMIN)', description: 'Defines privileges.' },
      {
        name: 'isEmailVerified',
        type: 'Boolean',
        description: 'Tracks completion of registration handshakes.',
      },
      { name: 'createdAt', type: 'DateTime', description: 'UTC record timestamp.' },
      { name: 'updatedAt', type: 'DateTime', description: 'UTC tracking update events.' },
    ],
    indexes: ['email (Unique index for high-performance direct credential validation lookups)'],
  },
  {
    name: 'Session',
    description:
      'Stateless JWT support alongside optional server-controlled user session records to enable on-demand session revoking.',
    fields: [
      { name: 'id', type: 'String (UUID)', isPrimary: true, description: 'Primary key.' },
      {
        name: 'userId',
        type: 'String (UUID)',
        relationTo: 'User',
        description: 'FK linking tracking active user session.',
      },
      {
        name: 'tokenHash',
        type: 'String',
        isUnique: true,
        description: 'Secure SHA-256 hash of the transparent session token.',
      },
      {
        name: 'userAgent',
        type: 'String',
        isNullable: true,
        description: 'Browser string recorded for diagnostic logging.',
      },
      {
        name: 'ipAddress',
        type: 'String',
        isNullable: true,
        description: 'Client IP tracking origin.',
      },
      { name: 'expiresAt', type: 'DateTime', description: 'Session expiration deadline.' },
      { name: 'createdAt', type: 'DateTime', description: 'Timestamp of session startup.' },
    ],
    indexes: [
      'userId (Foreign key target lookup optimizer)',
      'tokenHash (Unique lookups matching session identifier)',
    ],
  },
  {
    name: 'RefreshToken',
    description:
      'Tracks persistent Refresh Tokens issued during credential logins. Implements refresh token rotation security mechanisms.',
    fields: [
      { name: 'id', type: 'String (UUID)', isPrimary: true, description: 'Primary key.' },
      {
        name: 'userId',
        type: 'String (UUID)',
        relationTo: 'User',
        description: 'FK associating token to its parent client.',
      },
      {
        name: 'tokenHash',
        type: 'String',
        isUnique: true,
        description: 'One-way SHA-256 hash of plaintext refresh token to defend against db leak.',
      },
      { name: 'expiresAt', type: 'DateTime', description: 'Token expiration date.' },
      { name: 'createdAt', type: 'DateTime', description: 'Record initialization date.' },
      {
        name: 'revokedAt',
        type: 'DateTime',
        isNullable: true,
        description: 'If populated, token has been explicitly invalidated or recycled.',
      },
      {
        name: 'replacedBy',
        type: 'String',
        isNullable: true,
        description: 'Explicit reference to next token in rotation tree to detect replay attacks.',
      },
    ],
    indexes: [
      'userId (FK index helper)',
      'tokenHash (Index lookup matching request header cookies)',
    ],
  },
  {
    name: 'EmailVerificationToken',
    description:
      'Temporary tokens dispatched during user registration. Cleanses database from unverified garbage.',
    fields: [
      { name: 'id', type: 'String (UUID)', isPrimary: true, description: 'Ticket identifier.' },
      {
        name: 'userId',
        type: 'String (UUID)',
        relationTo: 'User',
        description: 'FK linking target.',
      },
      {
        name: 'token',
        type: 'String',
        isUnique: true,
        description: 'Secure cryptographic verification string.',
      },
      {
        name: 'expiresAt',
        type: 'DateTime',
        description: 'Mandatory TTL expiry point (default 24h).',
      },
      { name: 'createdAt', type: 'DateTime', description: 'Timestamp.' },
    ],
    indexes: ['userId (Relationship FK)', 'token (Unique lookup index on user submission)'],
  },
  {
    name: 'PasswordResetToken',
    description:
      'Disposable single-use ticket to recover profile access. Expires extremely fast (e.g., 1 hour).',
    fields: [
      { name: 'id', type: 'String (UUID)', isPrimary: true, description: 'Identifier.' },
      {
        name: 'userId',
        type: 'String (UUID)',
        relationTo: 'User',
        description: 'FK linking model.',
      },
      {
        name: 'token',
        type: 'String',
        isUnique: true,
        description: 'Hashed recovery reset ticket value matching mail parameters.',
      },
      { name: 'expiresAt', type: 'DateTime', description: 'Short expiry timestamp (e.g. 1 hour).' },
      { name: 'createdAt', type: 'DateTime', description: 'Creation date.' },
    ],
    indexes: ['userId (FK target)', 'token (Direct submission validator lookup)'],
  },
  {
    name: 'LoginHistory',
    description:
      'Continuous audit record capturing login event details, helping clients and systems detect unauthorized credential stuffing or hijacking.',
    fields: [
      { name: 'id', type: 'String (UUID)', isPrimary: true, description: 'Record entry id.' },
      {
        name: 'userId',
        type: 'String (UUID)',
        relationTo: 'User',
        description: 'FK tracking target user.',
      },
      { name: 'ipAddress', type: 'String', description: 'Client IP metadata.' },
      { name: 'userAgent', type: 'String', description: 'Captured HTTP browser agent string.' },
      {
        name: 'status',
        type: 'Boolean',
        description: 'Indicator of access success (true) or credential rejection (false).',
      },
      {
        name: 'failureReason',
        type: 'String',
        isNullable: true,
        description: 'Diagnosis of why entry was rejected (e.g., WRONG_PASSWORD, UNVERIFIED).',
      },
      { name: 'createdAt', type: 'DateTime', description: 'Login submission date.' },
    ],
    indexes: [
      'userId (To retrieve user history trails rapidly with pagination)',
      'createdAt (To index list lookups based on chronological order)',
    ],
  },
  {
    name: 'AuditLog',
    description:
      'Highly secured historical trail capturing actions triggered by admins, or crucial updates such as password modifications.',
    fields: [
      { name: 'id', type: 'String (UUID)', isPrimary: true, description: 'Primary reference key.' },
      {
        name: 'userId',
        type: 'String (UUID)',
        isNullable: true,
        relationTo: 'User',
        description: 'The identity prompting state change (null for unauthenticated events).',
      },
      {
        name: 'action',
        type: 'Enum (AuditAction)',
        description: 'Immutable action categorizing change (e.g., USER_ROLE_UPDATED).',
      },
      { name: 'ipAddress', type: 'String', description: 'Originating terminal address.' },
      { name: 'userAgent', type: 'String', description: 'Originating browser agent.' },
      {
        name: 'payload',
        type: 'Json',
        isNullable: true,
        description:
          'Immutable diff block detailing exact change metadata (e.g., before vs after state).',
      },
      { name: 'createdAt', type: 'DateTime', description: 'Chronology timestamp.' },
    ],
    indexes: [
      'userId (Tenant lookup optimization)',
      'action (Filtering matching audit logs by actions)',
      'createdAt (Sorting chronologically to audit records)',
    ],
  },
];
