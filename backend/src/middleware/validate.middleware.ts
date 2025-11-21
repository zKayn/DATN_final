import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ResponseUtil } from '../utils/response';

export class ValidateMiddleware {
  /**
   * Validate request with express-validator
   */
  static validate(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const extractedErrors: any[] = [];
      errors.array().map(err => extractedErrors.push({ [err.type === 'field' ? err.path : 'error']: err.msg }));

      return ResponseUtil.error(
        res,
        'Validation failed',
        JSON.stringify(extractedErrors),
        422
      );
    };
  }

  /**
   * Check if required fields exist
   */
  static checkRequiredFields(fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const missingFields: string[] = [];

      fields.forEach(field => {
        if (!req.body[field]) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        return ResponseUtil.error(
          res,
          'Missing required fields',
          `Required: ${missingFields.join(', ')}`,
          400
        );
      }

      next();
    };
  }
}