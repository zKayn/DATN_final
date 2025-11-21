// backend/src/middleware/auth.middleware.ts

import { Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../types';

export class AuthMiddleware {
  /**
   * Authenticate regular user
   */
  static authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      console.log('🔐 User authentication...');
      
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ No token provided');
        return ResponseUtil.error(res, 'No token provided', 'UNAUTHORIZED', 401);
      }

      const token = authHeader.substring(7);
      console.log('🔑 Token found:', token.substring(0, 20) + '...');

      try {
        const decoded = JWTUtil.verifyAccessToken(token);
        console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email });
        
        req.user = decoded;
        next();
      } catch (error) {
        console.error('❌ Token verification failed:', error);
        return ResponseUtil.error(res, 'Invalid or expired token', 'UNAUTHORIZED', 401);
      }
    } catch (error: any) {
      console.error('❌ Authentication error:', error.message);
      return ResponseUtil.error(res, error.message, 'UNAUTHORIZED', 401);
    }
  }

  /**
   * Authenticate admin user
   */
  static authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      console.log('🔐 Admin authentication...');
      console.log('📋 Request path:', req.path);
      console.log('📋 Request method:', req.method);
      
      const authHeader = req.headers.authorization;
      console.log('📋 Auth header:', authHeader ? 'Present' : 'Missing');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ No token provided');
        return ResponseUtil.error(res, 'No token provided', 'UNAUTHORIZED', 401);
      }

      const token = authHeader.substring(7);
      console.log('🔑 Token found:', token.substring(0, 20) + '...');

      try {
        const decoded = JWTUtil.verifyAccessToken(token);
        console.log('✅ Token decoded:', { 
          userId: decoded.userId, 
          email: decoded.email, 
          role: decoded.role 
        });
        
        // Check if user has admin role
        if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'ADMIN') {
          console.log('❌ User is not admin. Role:', decoded.role);
          return ResponseUtil.error(res, 'Admin access required', 'FORBIDDEN', 403);
        }

        console.log('✅ Admin authenticated:', decoded.email);

        req.user = decoded;
        next();
      } catch (error: any) {
        console.error('❌ Token verification failed:', error.message);
        return ResponseUtil.error(res, 'Invalid or expired token', 'UNAUTHORIZED', 401);
      }
    } catch (error: any) {
      console.error('❌ Admin authentication error:', error.message);
      return ResponseUtil.error(res, error.message, 'UNAUTHORIZED', 401);
    }
  }
}