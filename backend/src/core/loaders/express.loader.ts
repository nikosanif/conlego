import cors from 'cors';
import morgan from 'morgan';
import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import { MethodNotAllowed } from 'http-errors';
import { apiRouter } from '@app/api';
import { ILoader } from '@core/types';
import { logger } from '@core/utils/logger';
import { GlobalErrorHandlerMiddleware, MongooseQueryParserMiddleware } from '@app/middlewares';


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
        .use(cors())
        .use(morgan('dev'))
        .use(bodyParser.json({ limit: '5MB' }))
        .use(bodyParser.urlencoded({ extended: true }))
        .use(methodOverride())

        // Add middlewares
        .use(MongooseQueryParserMiddleware());

      // setup primary app routes.
      application.use(apiRouter);

      // all other routes should return 405 error (Method Not Allowed)
      application
        .route('/*')
        .all((req, res) => { throw new MethodNotAllowed(); });

      // global error handler
      // !it has to be the last
      application.use(GlobalErrorHandlerMiddleware());

      return application;

    } catch (e) {
      logger.error(`Express loader error: `, e);
      throw e;
    }
  }

}
