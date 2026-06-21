import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import authRoutes from './v1/auth.routes';
import userRoutes from './v1/user.routes';
import adminRoutes from './v1/admin.routes';

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
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/admin', adminRoutes);

export default router;
