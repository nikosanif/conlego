import express from 'express';
import mongoose from 'mongoose';
import { INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY } from 'http-status-codes';

/**
 * Middleware for handling global errors in express
 *
 * @export
 * @param {*} error
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {express.ErrorRequestHandler}
 */
export function GlobalErrorHandlerMiddleware(
  error: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): express.ErrorRequestHandler {

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
  return;
}
