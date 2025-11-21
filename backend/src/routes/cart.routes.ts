// backend/src/routes/cart.routes.ts

import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { CartController } from '../controllers/cart.controller';

const router = Router();

// All cart routes require authentication
router.get('/', AuthMiddleware.authenticate, CartController.get);
router.post('/add', AuthMiddleware.authenticate, CartController.add);
router.put('/:id', AuthMiddleware.authenticate, CartController.update);
router.delete('/:id', AuthMiddleware.authenticate, CartController.remove);
router.delete('/', AuthMiddleware.authenticate, CartController.clear);

export default router;