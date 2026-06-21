import { User, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.config';

export class UserRepository {
  public static async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  public static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  public static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  public static async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
}
