import crypto from 'crypto';
import { AuditAction, User } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { VerificationTokenRepository } from '../repositories/verification-token.repository';
import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { hashPassword, verifyPassword } from '../utils/hash.util';
import { UnauthorizedError, ConflictError, BadRequestError } from '../utils/api-error';

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

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await VerificationTokenRepository.create({
      token: verificationToken,
      user: { connect: { id: user.id } },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await EmailService.sendVerificationEmail(user.email, verificationToken);

    await AuditRepository.create({
      action: AuditAction.USER_REGISTERED,
      user: { connect: { id: user.id } },
      ipAddress: ip,
      userAgent: userAgent,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
  }

  /**
   * Verify email
   */
  public static async verifyEmail(token: string, ip: string, userAgent: string) {
    const tokenRecord = await VerificationTokenRepository.findByToken(token);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    await UserRepository.update(tokenRecord.userId, { isEmailVerified: true });
    await VerificationTokenRepository.deleteById(tokenRecord.id);

    await AuditRepository.create({
      action: AuditAction.EMAIL_VERIFIED,
      user: { connect: { id: tokenRecord.userId } },
      ipAddress: ip,
      userAgent: userAgent,
    });
  }

  /**
   * Login a user
   */
  public static async login(email: string, password: string, ip: string, userAgent: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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

    if (tokenRecord.revokedAt) {
      await TokenRepository.deleteRefreshTokensByUserId(tokenRecord.userId);
      throw new UnauthorizedError('Security breach detected. All sessions invalidated.');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await TokenRepository.deleteRefreshTokenById(tokenRecord.id);
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = (tokenRecord as any).user as User;
    const payload = { userId: user.id, email: user.email, role: user.role };

    const newAccessToken = TokenService.generateAccessToken(payload);
    const newRefreshToken = TokenService.generateRefreshToken(payload);
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

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

  /**
   * Forgot password
   */
  public static async forgotPassword(email: string, ip: string, userAgent: string) {
    const user = await UserRepository.findByEmail(email);

    // Security best practice: don't reveal if user exists
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      await PasswordResetTokenRepository.create({
        token: resetToken,
        user: { connect: { id: user.id } },
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      });

      await EmailService.sendPasswordResetEmail(user.email, resetToken);

      await AuditRepository.create({
        action: AuditAction.PASSWORD_RESET_REQUEST,
        user: { connect: { id: user.id } },
        ipAddress: ip,
        userAgent: userAgent,
      });
    }
  }

  /**
   * Reset password
   */
  public static async resetPassword(
    token: string,
    password: string,
    ip: string,
    userAgent: string,
  ) {
    const tokenRecord = await PasswordResetTokenRepository.findByToken(token);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(password);
    await UserRepository.update(tokenRecord.userId, { passwordHash });
    await PasswordResetTokenRepository.deleteByUserId(tokenRecord.userId);
    // Also invalidate all sessions on password change
    await TokenRepository.deleteRefreshTokensByUserId(tokenRecord.userId);

    await AuditRepository.create({
      action: AuditAction.PASSWORD_RESET_SUCCESS,
      user: { connect: { id: tokenRecord.userId } },
      ipAddress: ip,
      userAgent: userAgent,
    });
  }
}
