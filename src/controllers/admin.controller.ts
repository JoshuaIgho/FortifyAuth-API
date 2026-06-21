import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuditRepository } from '../repositories/audit.repository';

export class AdminController {
  public static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await AuditRepository.findAll();
      res.status(StatusCodes.OK).json({
        status: 'success',
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
