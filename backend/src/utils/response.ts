// backend/src/utils/response.ts

import { Response } from 'express';
import { PaginationMeta } from '../types';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    error?: string,
    statusCode: number = 400
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }

  static badRequest(res: Response, message = 'Bad request') {
    return res.status(400).json({
      success: false,
      message,
    });
  }

  static notFound(res: Response, message = 'Not found') {
    return res.status(404).json({
      success: false,
      message,
    });
  }

  static conflict(res: Response, message = 'Conflict') {
    return res.status(409).json({
      success: false,
      message,
    });
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return res.status(401).json({
      success: false,
      message,
    });
  }

  static forbidden(res: Response, message = 'Forbidden') {
    return res.status(403).json({
      success: false,
      message,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    meta: PaginationMeta,
    message: string = 'Success',
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static generatePaginationMeta(
    total: number,
    page: number,
    limit: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}