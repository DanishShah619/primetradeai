import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';

export const registerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body);
    sendCreated(res, user);
  } catch (err) {
    next(err);
  }
};

export const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, { data: result });
  } catch (err) {
    next(err);
  }
};

export const refreshHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.refresh(req.body);
    sendSuccess(res, { data: result });
  } catch (err) {
    next(err);
  }
};

export const logoutHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, { data: { message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
};

export const meHandler = (req: Request, res: Response) => {
  sendSuccess(res, { data: req.user });
};
