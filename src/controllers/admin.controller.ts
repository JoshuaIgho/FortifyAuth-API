import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuditRepository } from '../repositories/audit.repository';
import { AdminService } from '../services/admin.service';

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

  public static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await AdminService.getMetrics();
      res.status(StatusCodes.OK).json({
        status: 'success',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AdminService.getAllUsers();
      res.status(StatusCodes.OK).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}
