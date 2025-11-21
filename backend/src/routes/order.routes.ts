// backend/src/routes/order.routes.ts

import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// User routes
router.post('/', AuthMiddleware.authenticate, OrderController.create);
router.get('/', AuthMiddleware.authenticate, OrderController.getUserOrders);
router.get('/:id', AuthMiddleware.authenticate, OrderController.getById);
router.get('/number/:orderNumber', AuthMiddleware.authenticate, OrderController.getByNumber);
router.put('/:id/cancel', AuthMiddleware.authenticate, OrderController.cancel);

// 🔥 UPDATE STATUS - Available for both users and admins
router.put('/:id/status', AuthMiddleware.authenticate, OrderController.updateStatus);

export default router;