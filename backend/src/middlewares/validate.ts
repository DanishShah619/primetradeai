import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

type RequestPart = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodTypeAny, part: RequestPart = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      req[part] = schema.parse(req[part]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.reduce<Record<string, string[]>>((acc, e) => {
          const key = e.path.join('.');
          acc[key] = [...(acc[key] ?? []), e.message];
          return acc;
        }, {});
        return next(ApiError.badRequest('Validation failed', errors));
      }
      next(err);
    }
  };
