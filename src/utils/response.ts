import { Response } from 'express';

export function sendSuccess(res: Response, statusCode: number, message: string, data?: any) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
}

export function sendError(res: Response, statusCode: number, message: string, errors?: any) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors ?? message,
  });
}
