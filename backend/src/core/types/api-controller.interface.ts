import { Router } from 'express';
import { ICrudRouteOptions } from './crud.interface';

// Get the keys that are flagged as function
// tslint:disable-next-line: ban-types
type MethodNames<T> = { [K in keyof T]: T[K] extends Function ? K : never; }[keyof T];

// Get keys of method excluding other keys methods
type MethodNamesWithout<T, U> = Exclude<MethodNames<T>, MethodNames<U>>;

// Get controller methods type
export type ControllerMethods<T> = MethodNamesWithout<T, IApiController>;

/**
 * Interface for API controller declarations
 *
 * @export
 * @interface IApiController
 */
export interface IApiController {
  applyRoutes(options?: ICrudRouteOptions[]): Router;
}
