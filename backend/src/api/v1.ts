import * as express from 'express';
import { AuthenticatedMiddleware } from '@app/middlewares';
import { UserController } from './controllers/user.controller';
import { NotificationModel, INotification } from '@app/models';
import { ResourceController } from '@app/core/resource-controller';


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


export { apiV1Router };

