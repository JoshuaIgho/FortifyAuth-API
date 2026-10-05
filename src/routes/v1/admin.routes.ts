import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Allow authenticated users to view audit logs and metrics for demo/dashboard accessibility,
// or restrict to ADMIN if authenticated admin
router.get('/audit-logs', authenticate, AdminController.getAuditLogs);
router.get('/metrics', authenticate, AdminController.getMetrics);
router.get('/users', authenticate, authorize(Role.ADMIN), AdminController.getUsers);

export default router;
