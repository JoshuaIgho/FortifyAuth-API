import { TokenService } from './token.service';
import { env } from '../config/env.config';
import jwt from 'jsonwebtoken';

describe('TokenService', () => {
  const payload = {
    userId: 'user-uuid',
    email: 'test@example.com',
    role: 'USER',
  };

  it('should generate a valid access token', () => {
    const token = TokenService.generateAccessToken(payload);
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should verify a valid access token', () => {
    const token = jwt.sign(payload, env.JWT_ACCESS_SECRET);
    const verified = TokenService.verifyAccessToken(token);
    expect(verified.userId).toBe(payload.userId);
  });

  it('should generate a valid refresh token', () => {
    const token = TokenService.generateRefreshToken(payload);
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
    expect(decoded.userId).toBe(payload.userId);
  });
});
