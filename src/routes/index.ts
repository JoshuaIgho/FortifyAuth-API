import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const router = Router();

router.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'FortifyAuth API is healthy and operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// v1 routes will be added here
// router.use('/v1', v1Routes);

export default router;
