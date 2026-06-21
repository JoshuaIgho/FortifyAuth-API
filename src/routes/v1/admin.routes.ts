import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/audit-logs', authenticate, authorize(Role.ADMIN), AdminController.getAuditLogs);

export default router;
