import { AuditLog, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.config';

export class AuditRepository {
  public static async create(data: Prisma.AuditLogCreateInput): Promise<AuditLog> {
    return prisma.auditLog.create({ data });
  }

  public static async findByUserId(userId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
