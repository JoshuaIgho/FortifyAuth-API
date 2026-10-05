import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SessionService } from '../services/session.service';

export class SessionController {
  public static async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const ip = req.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const sessions = await SessionService.getUserSessions(userId, ip, userAgent);
      res.status(StatusCodes.OK).json({
        status: 'success',
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const ip = req.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      await SessionService.revokeSession(id, userId, ip, userAgent);
      res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'Session revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
