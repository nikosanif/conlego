import * as express from 'express';
import { isAuthenticated } from '../auth';
import { ResourceController } from '../shared';
import { UserController } from './user/user.controller';
import { NotificationModel, INotification } from '@app/models';


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
    isAuthenticated(),
    new ResourceController<INotification>(NotificationModel).applyRoutes()
  );


export { apiV1Router };

