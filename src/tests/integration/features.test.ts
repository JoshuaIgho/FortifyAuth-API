import { jest } from '@jest/globals';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

jest.unstable_mockModule('../../config/prisma.config', () => ({
  __esModule: true,
  prisma: prismaMock,
  default: prismaMock,
}));

jest.unstable_mockModule('isomorphic-dompurify', () => ({
  __esModule: true,
  default: {
    sanitize: (str: string) => str,
  },
}));

const { default: app } = await import('../../app');
const { StatusCodes } = await import('http-status-codes');
const { default: request } = await import('supertest');
const { TokenService } = await import('../../services/token.service');

describe('Sessions, API Keys, and Admin Integration Tests', () => {
  const dbUser = {
    id: 'user-uuid',
    email: 'user@example.com',
    role: 'USER',
  };

  const token = TokenService.generateAccessToken({
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Session Routes (/api/v1/sessions)', () => {
    it('should fail if unauthorized', async () => {
      const res = await request(app).get('/api/v1/sessions');
      expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should get active sessions for authenticated user', async () => {
      prismaMock.deviceSession.findMany.mockResolvedValue([
        {
          id: 'session-1',
          userId: dbUser.id,
          deviceName: 'MacBook Pro',
          userAgent: 'Mozilla/5.0 (Macintosh)',
          ipAddress: '127.0.0.1',
          lastActive: new Date(),
          createdAt: new Date(),
        },
      ] as any);

      const res = await request(app)
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBe(1);
    });

    it('should revoke session successfully', async () => {
      prismaMock.deviceSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: dbUser.id,
      } as any);
      prismaMock.deviceSession.delete.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .delete('/api/v1/sessions/session-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.message).toContain('revoked');
    });
  });

  describe('API Key Routes (/api/v1/api-keys)', () => {
    it('should get API keys for authenticated user', async () => {
      prismaMock.apiKey.findMany.mockResolvedValue([
        {
          id: 'key-1',
          userId: dbUser.id,
          name: 'CI Deployment Key',
          prefix: 'fa_live_1234...',
          scopes: ['read:users'],
          isActive: true,
          createdAt: new Date(),
        },
      ] as any);

      const res = await request(app)
        .get('/api/v1/api-keys')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data.length).toBe(1);
    });

    it('should create a new API key', async () => {
      prismaMock.apiKey.create.mockResolvedValue({
        id: 'key-new',
        userId: dbUser.id,
        name: 'Analytics Link',
        prefix: 'fa_live_abcd...',
        scopes: ['read:users'],
        isActive: true,
        createdAt: new Date(),
      } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/api-keys')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Analytics Link', scopes: ['read:users'] });

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body.data).toHaveProperty('secretReveal');
    });

    it('should delete an API key', async () => {
      prismaMock.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        userId: dbUser.id,
        name: 'Analytics Link',
      } as any);
      prismaMock.apiKey.delete.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .delete('/api/v1/api-keys/key-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.message).toContain('deleted');
    });
  });

  describe('Admin Routes (/api/v1/admin)', () => {
    it('should fetch audit logs', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          action: 'USER_REGISTERED',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest Test',
          createdAt: new Date(),
        },
      ] as any);

      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data.length).toBe(1);
    });

    it('should fetch telemetry metrics', async () => {
      prismaMock.user.count.mockResolvedValue(10);
      prismaMock.deviceSession.count.mockResolvedValue(5);
      prismaMock.refreshToken.count.mockResolvedValue(3);
      prismaMock.auditLog.count.mockResolvedValue(50);
      prismaMock.auditLog.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('activeSessions');
    });
  });
});
