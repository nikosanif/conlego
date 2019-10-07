import * as express from 'express';
import { AuthenticatedMiddleware } from '@core/middlewares';
import { UserController } from './controllers/user.controller';
import { NotificationModel, INotification } from '@app/models';
import { ResourceController } from '@core/utils/resource-controller';
import { ApiFactory } from '@core/utils/api-factory';
import { FooController } from './controllers/foo.controller';
import { NotificationController } from './controllers/notification.controller';

// const apiV1Router = express.Router();

// apiV1Router
//   // User routes
//   .use(
//     '/users',
//     new UserController().applyRoutes()
//   )
//   // Notification routes
//   .use(
//     '/notifications',
//     AuthenticatedMiddleware(),
//     new ResourceController<INotification>(NotificationModel).applyRoutes()
//   );


const apiFactory = new ApiFactory();

apiFactory
  .route('/users', UserController);

apiFactory
  .route('/notifications', NotificationController)
  .only(['create', 'update']);

apiFactory
  .route('/foo', FooController)
  .except(['helloWorld']);


const apiV1Router = apiFactory.getRouter();
export { apiV1Router };

