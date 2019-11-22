import { Document, Model } from 'mongoose';
import { ResourceProviderService } from './resource-provider.service';


export abstract class ResourceProvider<T extends Document> {

  /**
   * Mongoose model of resource
   *
   * @protected
   * @type {Model<T>}
   */
  protected model: Model<T>;

  /**
   * A service providing all
   * operations with database
   *
   * @protected
   * @type {ResourceProviderService<T>}
   */
  protected resourceProvider: ResourceProviderService<T>;

  constructor(model: Model<T>) {
    this.model = model;
    this.resourceProvider = new ResourceProviderService<T>(model);
  }

}
