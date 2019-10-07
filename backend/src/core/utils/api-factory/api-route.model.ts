import _ from 'lodash';
import { Router } from 'express';
import { IApiController, ControllerMethods } from '@core/types';


export class ApiRoute<T extends IApiController> {

  private path: string;
  private controller: T;
  private applicableRouteNames: Array<ControllerMethods<T>>;

  constructor(path: string, controllerConstructor: new () => T) {
    this.path = path;
    this.controller = new controllerConstructor();
    this.applicableRouteNames = this.getInstanceMethods(this.controller);
  }

  public only(methods: Array<ControllerMethods<T>>): ApiRoute<T> {
    this.applicableRouteNames = methods;

    return this;
  }

  public except(methods: Array<ControllerMethods<T>>): ApiRoute<T> {
    this.applicableRouteNames = _.difference(this.applicableRouteNames, methods);

    return this;
  }

  public getRouter(): Router {
    const router = Router();
    router.use(this.path, this.controller.applyRoutes());

    return router;
  }

  private getInstanceMethods(obj: any): Array<ControllerMethods<T>> {
    let props: string[] = [];

    do {
      const l = Object.getOwnPropertyNames(obj)
        .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
        .sort()
        .filter((p, i, arr) =>
          typeof obj[p] === 'function' &&   // only the methods
          p !== 'constructor' &&            // not the constructor
          p !== 'model' &&                  // not the model
          p !== 'applyRoutes' &&            // not the applyRoutes
          (i === 0 || p !== arr[i - 1]) &&  // not overriding in this prototype
          props.indexOf(p) === -1           // not overridden in a child
        );

      props = props.concat(l);
    }
    while (
      // tslint:disable-next-line: no-conditional-assignment
      (obj = Object.getPrototypeOf(obj)) &&   // walk-up the prototype chain
      Object.getPrototypeOf(obj)              // not the the Object prototype methods (hasOwnProperty, etc...)
    );

    return props as Array<ControllerMethods<T>>;
  }

}

