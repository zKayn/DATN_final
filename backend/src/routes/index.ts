// backend/src/routes/index.ts

import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import adminRoutes from './admin.routes';
import categoryRoutes from './category.routes';
import brandRoutes from './brand.routes';
import cartRoutes from './cart.routes';
import reviewRoutes from './review.routes'; // ✅ ADD THIS

const router = Router();

console.log('✅ Main routes loaded');

// Mount routes
console.log('📍 Mounting /auth routes');
router.use('/auth', authRoutes);

console.log('📍 Mounting /products routes');
router.use('/products', productRoutes);

console.log('📍 Mounting /categories routes');
router.use('/categories', categoryRoutes);

console.log('📍 Mounting /brands routes');
router.use('/brands', brandRoutes);

console.log('📍 Mounting /cart routes');
router.use('/cart', cartRoutes);

console.log('📍 Mounting /orders routes');
router.use('/orders', orderRoutes);

console.log('📍 Mounting /admin routes');
router.use('/admin', adminRoutes);

console.log('📍 Mounting /reviews routes'); // ✅ ADD THIS
router.use('/reviews', reviewRoutes); // ✅ ADD THIS

// Health check
router.get('/health', (req, res) => {
  console.log('🔵 Health check hit');
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;