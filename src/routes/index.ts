import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import authRoutes from './v1/auth.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'FortifyAuth API is healthy and operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.use('/api/v1/auth', authRoutes);

export default router;
