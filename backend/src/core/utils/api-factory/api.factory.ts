import { Router } from 'express';
import { ApiRoute } from './api-route.model';
import { IApiController } from '@core/types';

export class ApiFactory {

  private routes: Array<ApiRoute<any>>;

  constructor() {
    this.routes = [];
  }

  public route<T extends IApiController>(path: string, controllerConstructor: new () => T): ApiRoute<T> {
    const route = new ApiRoute<T>(path, controllerConstructor);
    this.routes.push(route);

    return route;
  }


  public getRouter(): Router {
    const router = Router();
    for (const route of this.routes) {
      const r = route.getRouter();
      router.use(r);
    }

    return router;
  }
}
