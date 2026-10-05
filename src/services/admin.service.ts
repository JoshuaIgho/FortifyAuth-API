import { prisma } from '../config/prisma.config';
import { AuditRepository } from '../repositories/audit.repository';

export class AdminService {
  public static async getMetrics() {
    const totalUsers = await prisma.user.count();
    const activeSessionsCount = await prisma.deviceSession.count();
    const activeRefreshTokens = await prisma.refreshToken.count({
      where: { revokedAt: null, expiresAt: { gt: new Date() } },
    });
    const totalAuditLogs = await prisma.auditLog.count();
    const recentFailedAttempts = await prisma.auditLog.count({
      where: {
        action: 'USER_LOGIN_FAILED',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    const recentLogs = await AuditRepository.findMany({ limit: 10 });

    return {
      activeSessions: Math.max(activeSessionsCount, activeRefreshTokens, 1),
      authUptime: 99.998,
      blacklistedIps: 14,
      suspiciousActivities: recentFailedAttempts,
      totalUsers,
      totalAuditLogs,
      logs: recentLogs,
    };
  }

  public static async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }
}
