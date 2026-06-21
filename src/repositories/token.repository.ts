import { RefreshToken, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.config';

export class TokenRepository {
  public static async createRefreshToken(
    data: Prisma.RefreshTokenCreateInput,
  ): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  public static async findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  public static async updateRefreshToken(
    id: string,
    data: Prisma.RefreshTokenUpdateInput,
  ): Promise<RefreshToken> {
    return prisma.refreshToken.update({ where: { id }, data });
  }

  public static async deleteRefreshTokensByUserId(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  }

  public static async deleteRefreshTokenById(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.delete({ where: { id } });
  }
}
