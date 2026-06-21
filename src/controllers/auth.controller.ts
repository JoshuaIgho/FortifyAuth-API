import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.service';
import { env } from '../config/env.config';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.register(
        email,
        password,
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown',
      );
      res.status(StatusCodes.CREATED).json({
        status: 'success',
        message: 'User registered successfully. Please verify your email.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(
        email,
        password,
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown',
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(StatusCodes.OK).json({
        status: 'success',
        data: { user, accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await AuthService.logout(
          refreshToken,
          req.ip || 'unknown',
          req.headers['user-agent'] || 'unknown',
        );
      }
      res.clearCookie('refreshToken');
      res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const providedToken = req.cookies.refreshToken;
      const { accessToken, refreshToken } = await AuthService.refreshToken(
        providedToken,
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown',
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(StatusCodes.OK).json({
        status: 'success',
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }
}
