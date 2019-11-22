import { Document } from 'mongoose';
import { ResourceProviderService } from './resource-provider.service';
import { ResourceModel } from '@core/types';


export abstract class ResourceProvider<T extends Document> {

  /**
   * Mongoose model of resource
   *
   * @protected
   * @type {ResourceModel<T>}
   */
  protected model: ResourceModel<T>;

  /**
   * A service providing all
   * operations with database
   *
   * @protected
   * @type {ResourceProviderService<T>}
   */
  protected resourceProvider: ResourceProviderService<T>;

  constructor(model: ResourceModel<T>) {
    this.model = model;
    this.resourceProvider = new ResourceProviderService<T>(model);
  }

}
