import { ApiKey, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.config';

export class ApiKeyRepository {
  public static async create(data: Prisma.ApiKeyCreateInput): Promise<ApiKey> {
    return prisma.apiKey.create({ data });
  }

  public static async findByUserId(userId: string): Promise<ApiKey[]> {
    return prisma.apiKey.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async findById(id: string): Promise<ApiKey | null> {
    return prisma.apiKey.findUnique({ where: { id } });
  }

  public static async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
    return prisma.apiKey.findUnique({ where: { keyHash } });
  }

  public static async deleteById(id: string): Promise<ApiKey> {
    return prisma.apiKey.delete({ where: { id } });
  }
}
