// backend/src/index.ts
// ✅ UPDATED WITH WISHLIST ROUTES

import express from 'express';
import cors from 'cors';
import http from 'http';
import routes from './routes';
import prisma from './config/database';
import socketService from './services/socket.service';
import wishlistRoutes from './routes/wishlist.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

console.log('🔧 Initializing Express app...');

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(httpServer);
console.log('✅ Socket.IO initialized');

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

console.log('✅ CORS configured');

// Body parser
app.use(express.json({ 
  limit: '50mb'
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '50mb'
}));

console.log('✅ Body parser configured');

// Request logging
app.use((req, res, next) => {
  console.log('\n===========================================');
  console.log('📥 INCOMING REQUEST');
  console.log('   Time:', new Date().toLocaleString());
  console.log('   Method:', req.method);
  console.log('   URL:', req.url);
  console.log('   Path:', req.path);
  console.log('   Body:', req.body);
  console.log('===========================================\n');
  next();
});

console.log('✅ Request logging configured');

// ==================== MOUNT ROUTES ====================
console.log('🔌 Mounting routes...');

// ✅ Wishlist routes - BEFORE main routes để avoid conflicts
app.use('/api/wishlist', wishlistRoutes);
console.log('✅ Wishlist routes mounted: /api/wishlist');

// Main API routes (includes auth, products, cart, orders, reviews, admin, etc.)
app.use('/api', routes);
console.log('✅ Main API routes mounted: /api');

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    socketConnected: socketService.getIO()?.engine.clientsCount || 0,
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.url}`,
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ ERROR HANDLER:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

// Start server
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
    
    httpServer.listen(PORT, () => {
      console.log('\n===========================================');
      console.log('🚀 SERVER IS RUNNING');
      console.log('📍 Local:   http://localhost:' + PORT);
      console.log('📍 Network: http://192.168.1.68:' + PORT);
      console.log('🔌 Socket.IO: Enabled');
      console.log('===========================================');
      console.log('\n📡 Available Routes:');
      console.log('\n🔓 Public Routes:');
      console.log('   POST /api/auth/login');
      console.log('   POST /api/auth/register');
      console.log('   GET  /api/products');
      console.log('   GET  /api/categories');
      console.log('   GET  /api/brands');
      console.log('   GET  /api/reviews/products/:id');
      console.log('\n🔐 Protected User Routes:');
      console.log('   GET  /api/cart');
      console.log('   POST /api/cart/add');
      console.log('   GET  /api/orders');
      console.log('   POST /api/orders');
      console.log('   GET  /api/reviews/my-reviews');
      console.log('   POST /api/reviews');
      console.log('\n❤️  Wishlist Routes (NEW):');
      console.log('   GET    /api/wishlist              - Get wishlist');
      console.log('   POST   /api/wishlist              - Add to wishlist');
      console.log('   DELETE /api/wishlist/:productId   - Remove from wishlist');
      console.log('   POST   /api/wishlist/toggle       - Toggle wishlist');
      console.log('   GET    /api/wishlist/check/:id    - Check status');
      console.log('   GET    /api/wishlist/count        - Get count');
      console.log('   DELETE /api/wishlist              - Clear all');
      console.log('\n👨‍💼 Admin Routes:');
      console.log('   POST /api/admin/auth/login');
      console.log('   GET  /api/admin/wishlists/stats   - Wishlist stats');
      console.log('   GET  /api/admin/wishlists         - All wishlists');
      console.log('===========================================\n');
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

export default app;