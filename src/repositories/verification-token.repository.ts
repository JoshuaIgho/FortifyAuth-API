import { EmailVerificationToken, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.config';

export class VerificationTokenRepository {
  public static async create(
    data: Prisma.EmailVerificationTokenCreateInput,
  ): Promise<EmailVerificationToken> {
    return prisma.emailVerificationToken.create({ data });
  }

  public static async findByToken(token: string): Promise<EmailVerificationToken | null> {
    return prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  public static async deleteByUserId(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.emailVerificationToken.deleteMany({ where: { userId } });
  }

  public static async deleteById(id: string): Promise<EmailVerificationToken> {
    return prisma.emailVerificationToken.delete({ where: { id } });
  }
}
