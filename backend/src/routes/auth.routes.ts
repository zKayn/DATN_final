// backend/src/routes/auth.routes.ts

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { ValidateMiddleware } from '../middleware/validate.middleware';

const router = Router();

console.log('✅ Auth routes loaded');

// Register - NO validation for now to test
router.post('/register', (req, res) => {
  console.log('🔵 Register route hit!');
  return AuthController.register(req, res);
});

// Login - NO validation for now to test  
router.post('/login', (req, res) => {
  console.log('🔵 Login route hit!');
  return AuthController.login(req, res);
});

router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthMiddleware.authenticate, AuthController.logout);
router.get('/profile', AuthMiddleware.authenticate, AuthController.getProfile);
router.put('/profile', AuthMiddleware.authenticate, AuthController.updateProfile);
router.post('/change-password', AuthMiddleware.authenticate, AuthController.changePassword);

export default router;