import { Router } from 'express';
import { UserController } from '../../controllers/user.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Success }
 *       401: { description: Unauthorized }
 */
router.get('/me', authenticate, UserController.getMe);

export default router;
