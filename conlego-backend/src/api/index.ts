import express, { Router } from 'express';
import { IApiController } from '@core/types';
import { DIContainer } from '@core/di-container';
import { OAuth2Server } from '@core/auth/oauth2';
import { AuthenticatedMiddleware } from '@core/middlewares';
import { UserController } from './controllers/user.controller';
import { INotification, NotificationModel } from '@app/models';
import { ResourceController } from '@core/utils/resource-controller';


export class Api implements IApiController {

  constructor() { }

  /**
   * Apply all routes of application
   *
   * @returns {Router}
   * @memberof Api
   */
  public applyRoutes(): Router {
    const apiRouter = express.Router();

    apiRouter.use('/api/auth/', this.getAuthRoutes());
    apiRouter.use('/api/v1/', this.getApiV1Routes());

    return apiRouter;
  }

  /**
   * Api routes
   *
   * @private
   * @returns {Router}
   * @memberof Api
   */
  private getApiV1Routes(): Router {
    const apiV1Router = express.Router();


    apiV1Router
      // User routes
      .use(
        '/users',
        new UserController().applyRoutes()
      )
      // Notification routes
      .use(
        '/notifications',
        AuthenticatedMiddleware(),
        new ResourceController<INotification>(NotificationModel).applyRoutes()
      );


    return apiV1Router;
  }

  /**
   * Auth routes
   *
   * @private
   * @returns {Router}
   */
  private getAuthRoutes(): Router {
    const authRouter = express.Router();

    // Retrieves a new token for an authorized token request.
    authRouter.post('/login', (req, res, next) => DIContainer
      .get(OAuth2Server)
      .retrieveToken()(req, res, next));

    // Revoke (delete) tokens
    authRouter.get('/logout', (req, res, next) => DIContainer
      .get(OAuth2Server)
      .deleteToken()(req, res, next));

    return authRouter;
  }

}
