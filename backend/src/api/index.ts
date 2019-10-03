import * as express from 'express';
import { apiV1Router } from './v1';


export class Api {

  /**
   * Apply all app routes including models and auth
   *
   * @returns {Promise<express.Router>}
   */
  public static async applyRoutes(): Promise<express.Router> {

    const apiRouter = express.Router();

    apiRouter.use('/api/v1/', apiV1Router);

    return apiRouter;
  }

}
