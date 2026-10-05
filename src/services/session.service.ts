import { AuditAction } from '@prisma/client';
import { SessionRepository } from '../repositories/session.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { NotFoundError, ForbiddenError } from '../utils/api-error';

export class SessionService {
  public static async getUserSessions(userId: string, currentIp: string, currentUa: string) {
    let sessions = await SessionRepository.findByUserId(userId);

    // If no sessions exist for user yet, create a record for current session
    if (sessions.length === 0) {
      const currentSession = await SessionRepository.create({
        deviceName: currentUa.includes('Mac')
          ? 'MacBook Pro'
          : currentUa.includes('Windows')
            ? 'Windows PC'
            : 'Web Client',
        userAgent: currentUa,
        ipAddress: currentIp,
        user: { connect: { id: userId } },
      });
      sessions = [currentSession];
    }

    return sessions.map((s) => ({
      id: s.id,
      deviceModel:
        s.deviceName ||
        (s.userAgent?.includes('Mac')
          ? 'MacBook Pro 16" (macOS)'
          : s.userAgent?.includes('iPhone')
            ? 'iPhone Device'
            : 'Browser Client'),
      type: s.userAgent?.toLowerCase().includes('mobile')
        ? ('smartphone' as const)
        : ('laptop' as const),
      ipAddress: s.ipAddress || '127.0.0.1',
      location:
        s.ipAddress === '127.0.0.1' || s.ipAddress === '::1' ? 'Local Gateway' : 'Paris, France',
      lastActive: s.lastActive,
      isCurrent: s.ipAddress === currentIp || sessions.length === 1,
    }));
  }

  public static async revokeSession(
    sessionId: string,
    userId: string,
    ip: string,
    userAgent: string,
  ) {
    const session = await SessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenError('You do not have permission to revoke this session');
    }

    await SessionRepository.deleteById(sessionId);

    await AuditRepository.create({
      action: AuditAction.SESSION_REVOKED,
      user: { connect: { id: userId } },
      ipAddress: ip,
      userAgent: userAgent,
      payload: { sessionId },
    });
  }
}
