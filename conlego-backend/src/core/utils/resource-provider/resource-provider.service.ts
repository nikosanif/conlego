import { QueryOptions } from 'mongoose-query-parser';
import { Document, PaginateModel, PaginateResult } from 'mongoose';
import { ResourceModel } from '@core/types';


export class ResourceProviderService<T extends Document> {

  private model: ResourceModel<T>;

  constructor(model: ResourceModel<T>) {
    this.model = model;
  }

  /**
   * Create new resource
   *
   * @param {T} resource
   * @returns {Promise<T>}
   */
  public async create(resource: T): Promise<T> {
    return new this.model(resource).save();
  }

  /**
   * Find resources list as simple list
   * or paginated if available to the model
   *
   * @param {QueryOptions} [queryOptions=null]
   * @param {boolean} [pagination=false]
   * @returns {(Promise<PaginateResult<T> | T[]>)}
   */
  public async find(
    queryOptions: QueryOptions = null,
    pagination: boolean = false
  ): Promise<PaginateResult<T> | T[]> {

    let resources: PaginateResult<T> | T[];
    queryOptions = queryOptions || ({} as any);

    if (pagination && (this.model as PaginateModel<T>).paginate) {
      const paginateOptions = {
        select: queryOptions.select,
        sort: queryOptions.sort,
        populate: queryOptions.populate,
        page: queryOptions.skip || 1,
        lean: false,
        leanWithId: false,
        limit: queryOptions.limit || 10,
      };

      // get paginated resources if available plugin
      resources = await (this.model as PaginateModel<T>)
        .paginate(queryOptions.filter, paginateOptions);

    } else {
      // else get resources as list
      resources = await this.model
        .find(queryOptions.filter)
        .select(queryOptions.select)
        .populate(queryOptions.populate)
        .sort(queryOptions.sort)
        .exec();

    }

    return resources;
  }

  /**
   * Get one resource by its ID
   *
   * @param {string} id
   * @param {QueryOptions} [queryOptions=null]
   * @returns {Promise<T>}
   */
  public async findById(id: string, queryOptions: QueryOptions = null): Promise<T> {
    queryOptions = queryOptions || ({} as any);

    return this.model
      .findOne({ _id: id })
      .select(queryOptions.select)
      .populate(queryOptions.populate)
      .exec();
  }

  /**
   * Update one resource by its ID
   *
   * @param {string} id
   * @param {T} resource
   * @returns {Promise<T>}
   */
  public async update(id: string, resource: T): Promise<T> {
    return this.model
      .findOneAndUpdate(
        { _id: id },
        resource,
        { new: true, runValidators: true, context: 'query' }
      )
      .exec();
  }

  /**
   * Delete one resource by its ID
   *
   * @param {string} id
   * @returns {Promise<T>}
   */
  public async delete(id: string): Promise<T> {
    return this.model
      .deleteById(id)
      .exec();
  }

}
