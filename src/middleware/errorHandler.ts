import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/response';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  console.error(err);
  return sendError(res, 500, 'Internal Server Error', 'Unexpected server error');
}
