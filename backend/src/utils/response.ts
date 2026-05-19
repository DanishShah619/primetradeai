import { Response } from 'express';

interface SuccessPayload<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  payload: SuccessPayload<T>,
  statusCode = 200,
) {
  return res.status(statusCode).json({
    success: true,
    data: payload.data,
    meta: payload.meta ?? null,
  });
}

export function sendCreated<T>(res: Response, data: T) {
  return sendSuccess(res, { data }, 201);
}

// Used only by errorHandler — not called directly from controllers
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: Record<string, string[]>,
) {
  return res.status(statusCode).json({
    success: false,
    error: { message, ...(errors && { errors }) },
  });
}
