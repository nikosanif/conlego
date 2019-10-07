import { NotFound } from 'http-errors';
import { QueryOptions } from 'mongoose-query-parser';
import { OK, CREATED, NO_CONTENT } from 'http-status-codes';
import { Request, Response, Router, NextFunction } from 'express';
import { Model, Document, PaginateModel, PaginateResult, ResourceModel } from 'mongoose';
import { ResourceProvider } from '@core/utils/resource-provider';
import { ICrudController, ICrudRouteOptions, IApiController } from '@core/types';

export class ResourceController<T extends Document>
  extends ResourceProvider<T> implements ICrudController, IApiController {

  constructor(model: Model<T>) {
    super(model);
  }

  /**
   * Apply routes of CRUD operations
   * If no options available then it will apply all CRUD operations
   *
   * @param {ICrudRouteOptions[]} [options=[]]
   * @returns {Router}
   */
  public applyRoutes(options: ICrudRouteOptions[] = []): Router {
    const router = Router();

    // apply all routes if not provided
    if (options.length === 0) {
      options = [
        { operation: 'index' },
        { operation: 'create' },
        { operation: 'show' },
        { operation: 'update' },
        { operation: 'delete' }
      ];
    }

    // apply routes depending on options
    options.forEach(o => {
      const middleware = o.middleware || [];

      switch (o.operation) {
        case 'index':
          router.get('/', middleware, this.index());
          break;

        case 'create':
          router.post('/', middleware, this.create());
          break;

        case 'show':
          router.get('/:id', middleware, this.show());
          break;

        case 'update':
          router.put('/:id', middleware, this.update());
          router.patch('/:id', middleware, this.update());
          break;

        case 'delete':
          router.delete('/:id', middleware, this.delete());
          break;
      }
    });

    return router;
  }

  // #region CRUD methods

  /**
   * Get all resources paginated
   */
  public index() {
    return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
      try {
        // get list of resources
        const resources: PaginateResult<T> | T[] = await this
          .resourceProvider
          .find(req.mongooseQueryOptions, true);

        return res
          .status(OK)
          .json(resources);

      } catch (e) {
        next(e);
      }
    };
  }

  /**
   * Create a new resource instance
   */
  public create(blacklist: string[] = []) {
    return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
      try {
        // delete blacklisted properties from body
        const defaultBlacklist = ['_id', 'createdAt', 'updatedAt', ...blacklist];
        for (const key of defaultBlacklist) {
          delete req.body[key];
        }

        // create new resource
        const resource = await this
          .resourceProvider
          .create(req.body);

        return res
          .status(CREATED)
          .json(resource);

      } catch (e) {
        next(e);
      }
    };
  }

  /**
   * Get one resource instance by Id
   *
   * @param {string} [id] Model id to be retrieved
   * @returns
   */
  public show(id?: string) {
    return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
      try {
        const modelId = id || req.params.id;

        // find resource
        const resource = await this
          .resourceProvider
          .findById(modelId, req.mongooseQueryOptions);

        // throw error if not found
        if (!resource) { throw new NotFound(); }

        return res
          .status(OK)
          .json(resource);

      } catch (e) {
        next(e);
      }
    };
  }

  /**
   * Update one resource instance by Id
   *
   * @param {string} [id] Model id to be modified
   * @param {string[]} [blacklist=[]] List of properties to ignore
   * @returns
   */
  public update(id?: string, blacklist: string[] = []) {
    return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
      try {
        const modelId = id || req.params.id;

        // get read only properties if available in order to ignore them
        const readonlyPropsOfModel: string[] = (this.model as ResourceModel<T>).getReadonlyProperties
          ? (this.model as ResourceModel<T>).getReadonlyProperties()
          : [];

        // delete blacklisted properties from body
        const defaultBlacklist = ['_id', 'createdAt', 'updatedAt', ...readonlyPropsOfModel, ...blacklist];
        for (const key of defaultBlacklist) {
          delete req.body[key];
        }

        // update resource
        const resource = await this
          .resourceProvider
          .update(modelId, req.body);

        // throw error if not found
        if (!resource) { throw new NotFound(); }

        return res
          .status(OK)
          .json(resource);

      } catch (e) {
        next(e);
      }
    };
  }

  /**
   * Delete one resource instance by Id
   *
   * @param {string} [id] Model id to be deleted
   */
  public delete(id?: string) {
    return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
      try {
        const modelId = id || req.params.id;

        const resource = await this
          .resourceProvider
          .delete(modelId);

        // throw error if not found
        if (!resource) { throw new NotFound(); }

        return res
          .sendStatus(NO_CONTENT);

      } catch (e) {
        next(e);
      }
    };
  }

  // #endregion CRUD methods
  // --------------------------------------

}
