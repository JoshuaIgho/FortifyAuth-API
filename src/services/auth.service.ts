import crypto from 'crypto';
import { AuditAction, User } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { TokenService } from './token.service';
import { hashPassword, verifyPassword } from '../utils/hash.util';
import { UnauthorizedError, ConflictError } from '../utils/api-error';

export class AuthService {
  /**
   * Register a new user
   */
  public static async register(email: string, password: string, ip: string, userAgent: string) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const passwordHash = await hashPassword(password);
    const user = await UserRepository.create({
      email,
      passwordHash,
    });

    await AuditRepository.create({
      action: AuditAction.USER_REGISTERED,
      user: { connect: { id: user.id } },
      ipAddress: ip,
      userAgent: userAgent,
    });

    // TODO: Create and send verification token

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
  }

  /**
   * Login a user
   */
  public static async login(email: string, password: string, ip: string, userAgent: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    // Hash refresh token for storage
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await TokenRepository.createRefreshToken({
      user: { connect: { id: user.id } },
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    await AuditRepository.create({
      action: AuditAction.USER_LOGIN_SUCCESS,
      user: { connect: { id: user.id } },
      ipAddress: ip,
      userAgent: userAgent,
    });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logout a user
   */
  public static async logout(refreshToken: string, ip: string, userAgent: string) {
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const tokenRecord = await TokenRepository.findRefreshTokenByHash(refreshTokenHash);

    if (tokenRecord) {
      await TokenRepository.deleteRefreshTokenById(tokenRecord.id);
      await AuditRepository.create({
        action: AuditAction.USER_LOGOUT,
        user: { connect: { id: tokenRecord.userId } },
        ipAddress: ip,
        userAgent: userAgent,
      });
    }
  }

  /**
   * Refresh access token using rotation
   */
  public static async refreshToken(providedToken: string, ip: string, userAgent: string) {
    const refreshTokenHash = crypto.createHash('sha256').update(providedToken).digest('hex');
    const tokenRecord = await TokenRepository.findRefreshTokenByHash(refreshTokenHash);

    if (!tokenRecord) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Breach detection: If token is revoked, invalidate all user sessions
    if (tokenRecord.revokedAt) {
      await TokenRepository.deleteRefreshTokensByUserId(tokenRecord.userId);
      throw new UnauthorizedError('Security breach detected. All sessions invalidated.');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await TokenRepository.deleteRefreshTokenById(tokenRecord.id);
      throw new UnauthorizedError('Refresh token expired');
    }

    // Since we used include: { user: true } in repository
    const user = (tokenRecord as any).user as User;
    const payload = { userId: user.id, email: user.email, role: user.role };

    const newAccessToken = TokenService.generateAccessToken(payload);
    const newRefreshToken = TokenService.generateRefreshToken(payload);
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    // Rotate tokens
    await TokenRepository.updateRefreshToken(tokenRecord.id, {
      revokedAt: new Date(),
      replacedBy: newRefreshTokenHash,
    });

    await TokenRepository.createRefreshToken({
      user: { connect: { id: user.id } },
      tokenHash: newRefreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
