import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { jest } from '@jest/globals';

jest.mock('../config/prisma.config', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import { prisma as actualPrisma } from '../config/prisma.config';
export const prismaMock = actualPrisma as unknown as DeepMockProxy<PrismaClient>;
