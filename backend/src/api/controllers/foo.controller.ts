import { Router, Request, Response, response } from 'express';
import { IApiController } from '@core/types';

export class FooController implements IApiController {

  constructor() { }

  public helloWorld() {
    return async (req: Request, res: Response): Promise<Response> => {
      return response.send('Hello World!');
    };
  }

  public applyRoutes(): Router {
    return Router();
  }

}
