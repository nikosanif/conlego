import * as mongoose from 'mongoose';

export declare type ModelDocumentType<T> = T & mongoose.Document;

export interface IResourceModel {

  /**
   * Hidden properties will never be exposed through the API
   *
   * @type {string[]}
   */
  hidden: string[];

  /**
   * Readonly properties will never be updated.
   * They are configured only on creation of model.
   *
   * @type {string[]}
   */
  readonly: string[];

}
