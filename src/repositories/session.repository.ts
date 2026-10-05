import { DeviceSession, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.config';

export class SessionRepository {
  public static async create(data: Prisma.DeviceSessionCreateInput): Promise<DeviceSession> {
    return prisma.deviceSession.create({ data });
  }

  public static async findByUserId(userId: string): Promise<DeviceSession[]> {
    return prisma.deviceSession.findMany({
      where: { userId },
      orderBy: { lastActive: 'desc' },
    });
  }

  public static async findById(id: string): Promise<DeviceSession | null> {
    return prisma.deviceSession.findUnique({ where: { id } });
  }

  public static async updateLastActive(id: string): Promise<DeviceSession> {
    return prisma.deviceSession.update({
      where: { id },
      data: { lastActive: new Date() },
    });
  }

  public static async deleteById(id: string): Promise<DeviceSession> {
    return prisma.deviceSession.delete({ where: { id } });
  }

  public static async countActiveSessions(): Promise<number> {
    return prisma.deviceSession.count();
  }
}
