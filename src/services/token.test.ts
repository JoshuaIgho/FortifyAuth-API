import { jest } from '@jest/globals';
import { TokenService } from './token.service';
import jwt from 'jsonwebtoken';

jest.mock('../config/env.config', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test-access-secret',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_REFRESH_EXPIRY: '7d',
  },
}));

describe('TokenService', () => {
  const payload = {
    userId: 'user-uuid',
    email: 'test@example.com',
    role: 'USER',
  };

  it('should generate a valid access token', () => {
    const token = TokenService.generateAccessToken(payload);
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, 'test-access-secret') as any;
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should verify a valid access token', () => {
    const token = jwt.sign(payload, 'test-access-secret');
    const verified = TokenService.verifyAccessToken(token);
    expect(verified.userId).toBe(payload.userId);
  });

  it('should generate a valid refresh token', () => {
    const token = TokenService.generateRefreshToken(payload);
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, 'test-refresh-secret') as any;
    expect(decoded.userId).toBe(payload.userId);
  });
});
