import { Router } from 'express';
import { ApiKeyController } from '../../controllers/api-key.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, ApiKeyController.getKeys);
router.post('/', authenticate, ApiKeyController.createKey);
router.delete('/:id', authenticate, ApiKeyController.deleteKey);

export default router;
