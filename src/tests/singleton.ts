import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { jest } from '@jest/globals';

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

jest.mock('../config/prisma.config', () => ({
  __esModule: true,
  prisma: prismaMock,
  default: prismaMock,
}));
