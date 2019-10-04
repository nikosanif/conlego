import mongoose from 'mongoose';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY } from 'http-status-codes';

/**
 * Middleware for handling global errors in express
 *
 * @export
 * @returns {ErrorRequestHandler}
 */
export function GlobalErrorHandlerMiddleware(): ErrorRequestHandler {
  return (error: any, req: Request, res: Response, next: NextFunction) => {

    let status = error.status || INTERNAL_SERVER_ERROR;
    const code = error.code || error.name || 'InternalServerError';
    const message = error.message || 'Internal Server Error';
    const errors = error.errors || undefined;

    // cast mongoose errors to bad request
    if (error instanceof mongoose.Error.CastError
      || error instanceof mongoose.Error.ValidationError) {
      status = UNPROCESSABLE_ENTITY;
    }

    res.status(status).json({ status, code, message, errors });
  };
}
