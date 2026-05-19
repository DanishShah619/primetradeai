import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
