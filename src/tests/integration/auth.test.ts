import request from 'supertest';
jest.mock('isomorphic-dompurify', () => ({ sanitize: (v: any) => v }));
import { StatusCodes } from 'http-status-codes';
import app from '../../app';
import { prisma } from '../../config/prisma.config';
import * as hashUtil from '../../utils/hash.util';
import { TokenService } from '../../services/token.service';

jest.mock('../../config/prisma.config', () => ({
  __esModule: true,
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const prismaMock = prisma as any;

describe('Auth Integration Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
  };

  const dbUser = {
    id: 'user-uuid',
    email: testUser.email,
    passwordHash: 'hashed-password',
    role: 'USER',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({ ...dbUser, isEmailVerified: false });
      prismaMock.emailVerificationToken.create.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const res = await request(app).post('/api/v1/auth/register').send(testUser);

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body.status).toBe('success');
    });
  });

  describe('GET /api/v1/auth/verify-email', () => {
    it('should verify email successfully', async () => {
      prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
        id: 'token-id',
        userId: 'user-uuid',
        expiresAt: new Date(Date.now() + 10000),
      });
      prismaMock.user.update.mockResolvedValue({});
      prismaMock.emailVerificationToken.delete.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const res = await request(app)
        .get('/api/v1/auth/verify-email')
        .query({ token: 'valid-token' });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.message).toContain('verified');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbUser);
      prismaMock.refreshToken.create.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      jest.spyOn(hashUtil, 'verifyPassword').mockResolvedValue(true);

      const res = await request(app).post('/api/v1/auth/login').send(testUser);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should fail if email not verified', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ ...dbUser, isEmailVerified: false });

      const res = await request(app).post('/api/v1/auth/login').send(testUser);

      expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(res.body.message).toContain('verify your email');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should always return 200 even if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(StatusCodes.OK);
    });

    it('should create a reset token if user exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbUser);
      prismaMock.passwordResetToken.create.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email });

      expect(res.status).toBe(StatusCodes.OK);
      expect(prismaMock.passwordResetToken.create).toHaveBeenCalled();
    });
  });

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(StatusCodes.OK);
    });
  });

  describe('Protected Routes', () => {
    it('should fail if no token provided for /me', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should allow access to /me with valid token', async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbUser);
      const token = TokenService.generateAccessToken({
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      });

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data.email).toBe(dbUser.email);
    });

    it('should forbid non-admin from audit-logs', async () => {
      const token = TokenService.generateAccessToken({
        userId: dbUser.id,
        email: dbUser.email,
        role: 'USER',
      });

      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });
  });
});
