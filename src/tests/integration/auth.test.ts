import { jest } from '@jest/globals';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import '../singleton'; // This must be imported before app
import app from '../../app';
import { prismaMock } from '../singleton';
import * as hashUtil from '../../utils/hash.util';
import { TokenService } from '../../services/token.service';

// Mock dependencies that cause issues in ESM + Jest
jest.mock('isomorphic-dompurify');

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
      prismaMock.user.create.mockResolvedValue({
        ...dbUser,
        isEmailVerified: false,
      } as any);
      prismaMock.emailVerificationToken.create.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

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
      } as any);
      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.emailVerificationToken.delete.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .get('/api/v1/auth/verify-email')
        .query({ token: 'valid-token' });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.message).toContain('verified');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbUser as any);
      prismaMock.refreshToken.create.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      jest.spyOn(hashUtil, 'verifyPassword').mockResolvedValue(true);

      const res = await request(app).post('/api/v1/auth/login').send(testUser);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data).toHaveProperty('accessToken');
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
      prismaMock.user.findUnique.mockResolvedValue(dbUser as any);
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
  });
});
