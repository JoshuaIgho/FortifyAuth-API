import { PasswordResetToken, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.config';

export class PasswordResetTokenRepository {
  public static async create(
    data: Prisma.PasswordResetTokenCreateInput,
  ): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({ data });
  }

  public static async findByToken(token: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  public static async deleteByUserId(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.passwordResetToken.deleteMany({ where: { userId } });
  }

  public static async deleteById(id: string): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.delete({ where: { id } });
  }
}
