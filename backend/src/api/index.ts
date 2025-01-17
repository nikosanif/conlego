import * as express from 'express';
import { Auth } from './auth';
import { apiV1Router } from './v1';

export class Api {

  /**
   * Apply all app routes including models and auth
   *
   * @param {express.Application} app
   * @returns {Promise<express.Router>}
   */
  public static async applyRoutes(app: express.Application): Promise<express.Router> {

    const apiRouter = express.Router();

    apiRouter.use('/api/auth/', await Auth.applyRoutes(app));
    apiRouter.use('/api/v1/', apiV1Router);

    return apiRouter;
  }

}
