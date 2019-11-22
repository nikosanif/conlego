import * as mongoose from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

export declare type ModelDocumentType<T> =
  T
  & mongoose.Document
  & SoftDeleteDocument;

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

export declare type ResourceModel<T> =
  mongoose.Model<ModelDocumentType<T>>
  & mongoose.PaginateModel<ModelDocumentType<T>>
  & SoftDeleteModel<ModelDocumentType<T>>;
