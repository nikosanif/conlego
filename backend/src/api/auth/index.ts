/**
 * Main file for user authentication
 */

import * as express from 'express';
import * as OAuth2 from './oauth2/oauth2.controller';
import { router as oauth2Router } from './oauth2';

export * from './auth.middleware';

export class Auth {

  /**
   * Apply auth routes for users
   *
   * @param {express.Application} app
   * @returns {Promise<express.Router>}
   */
  public static async applyRoutes(app: express.Application): Promise<express.Router> {

    // TODO: Implement - Review authorization_code grand type

    // Setup user details / model properties
    await OAuth2.setup(app);

    // Setup auth routes
    const authRouter = express.Router();
    authRouter.use('/local', oauth2Router);

    return authRouter;
  }

}
