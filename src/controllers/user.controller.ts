import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/api-error';

export class UserController {
  public static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new NotFoundError('User not found');
      }

      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userWithoutPassword } = user;

      res.status(StatusCodes.OK).json({
        status: 'success',
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
}
