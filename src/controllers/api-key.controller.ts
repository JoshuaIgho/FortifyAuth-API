import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiKeyService } from '../services/api-key.service';

export class ApiKeyController {
  public static async getKeys(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const keys = await ApiKeyService.getUserKeys(userId);
      res.status(StatusCodes.OK).json({
        status: 'success',
        data: keys,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createKey(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { name, scopes } = req.body;
      const ip = req.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await ApiKeyService.createKey(
        userId,
        name || 'API Key',
        Array.isArray(scopes) ? scopes : ['read:users'],
        ip,
        userAgent,
      );

      res.status(StatusCodes.CREATED).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteKey(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const ip = req.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      await ApiKeyService.deleteKey(id, userId, ip, userAgent);
      res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'API key deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
