import { Router } from 'express';
import { SessionController } from '../../controllers/session.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, SessionController.getSessions);
router.delete('/:id', authenticate, SessionController.revokeSession);

export default router;
