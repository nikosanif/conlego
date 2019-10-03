import * as express from 'express';
import { UserModel, IUser } from '@app/models';
import { ResourceController } from '@app/core/resource-controller';


const apiV1Router = express.Router();

apiV1Router
  // User routes
  .use(
    '/users',
    new ResourceController<IUser>(UserModel).applyRoutes()
  );


export { apiV1Router };

