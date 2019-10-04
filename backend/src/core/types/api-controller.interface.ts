import { Router } from 'express';
import { ICrudRouteOptions } from './crud.interface';

/**
 * Interface for API controller declarations
 *
 * @export
 * @interface IApiController
 */
export interface IApiController {
  applyRoutes(options?: ICrudRouteOptions[]): Router;
}
