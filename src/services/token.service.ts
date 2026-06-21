import jwt, { Secret } from 'jsonwebtoken';
import { env } from '../config/env.config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class TokenService {
  /**
   * Generate an Access Token (JWT)
   */
  public static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, {
      expiresIn: env.JWT_ACCESS_EXPIRY as any,
    });
  }

  /**
   * Verify an Access Token
   */
  public static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET as Secret) as TokenPayload;
  }

  /**
   * Generate a Refresh Token (Opaque/JWT)
   * In this implementation, we use a longer-lived JWT for the refresh token
   * but store its hash in the database for rotation and revocation.
   */
  public static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET as Secret, {
      expiresIn: env.JWT_REFRESH_EXPIRY as any,
    });
  }

  /**
   * Verify a Refresh Token
   */
  public static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET as Secret) as TokenPayload;
  }
}
