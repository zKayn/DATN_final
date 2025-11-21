import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class ErrorMiddleware {
  /**
   * Global error handler
   */
  static handle(err: any, req: Request, res: Response, next: NextFunction) {
    console.error('Error:', err);

    // Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({
        success: false,
        message: 'Database error',
        error: err.message,
      });
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: err.message,
      });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: err.message,
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: err.message,
      });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  /**
   * 404 handler
   */
  static notFound(req: Request, res: Response) {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      error: `Cannot ${req.method} ${req.path}`,
    });
  }
}