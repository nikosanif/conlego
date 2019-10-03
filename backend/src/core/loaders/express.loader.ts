import cors from 'cors';
import morgan from 'morgan';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import { MethodNotAllowed } from 'http-errors';
import { INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { Api } from '@app/api';
import { config } from '@config';
import { ILoader } from '@core/types';
import { logger } from '@core/utils/logger';


export class ExpressLoader implements ILoader {

  /**
   * Setup express application and return it
   *
   * @returns {Promise<void>}
   */
  public async load(): Promise<express.Application> {
    try {
      const application = express();

      application
        .set('port', config.port)
        .set('env', config.environment)

        .use(cors())
        .use(morgan('dev'))
        .use(bodyParser.json({ limit: '5MB' }))
        .use(bodyParser.urlencoded({ extended: true }))
        .use(methodOverride());

      // setup primary app routes.
      application
        .use(await Api.applyRoutes());

      // all other routes should return 405 error (Method Not Allowed)
      application
        .route('/*')
        .get((req, res) => { throw new MethodNotAllowed(); });

      // global error handler
      // !it has to be the last
      application.use(this.globalErrorHandler);

      return application;

    } catch (e) {
      logger.error(`Express loader error: `, e);
      throw e;
    }
  }

  /**
   * Global Middleware for handling errors
   * TODO: Move this to middlewares
   *
   * @private
   * @param {*} error
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  private globalErrorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction) {
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
  }


}
