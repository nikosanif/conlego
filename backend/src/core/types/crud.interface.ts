import { Request, Response, RequestHandler, Router, NextFunction } from 'express';
import { IApiController } from './api-controller.interface';

/**
 * CRUD operation definition
 */
export declare type CrudOperations =
  'create'      // create new resource
  | 'index'     // get list of resources
  | 'show'      // get one resource by id
  | 'update'    // update one resource by id
  | 'delete';   // delete one resource by id


/**
 * Route options for defining CRUD operations
 * and their middleware methods
 *
 * @export
 * @interface ICrudRouteOptions
 */
export interface ICrudRouteOptions {
  operation: CrudOperations;
  middleware?: RequestHandler[];
}


/**
 * Controller for implementing basic model methods
 * such as Create, Read, Update and Delete (CRUD)
 *
 * @export
 * @interface ICrudController
 */
export interface ICrudController extends IApiController {
  index(): (req: Request, res: Response, next?: NextFunction) => Promise<Response>;
  create(): (req: Request, res: Response, next?: NextFunction) => Promise<Response>;
  show(id?: string): (req: Request, res: Response, next?: NextFunction) => Promise<Response>;
  update(id?: string, blacklist?: string[]): (req: Request, res: Response, next?: NextFunction) => Promise<Response>;
  delete(id?: string): (req: Request, res: Response, next?: NextFunction) => Promise<Response>;
}
