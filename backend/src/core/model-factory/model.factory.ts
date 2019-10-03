import { Model, model, Schema } from 'mongoose';
import { buildSchema } from '@typegoose/typegoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import { defaultSchemaOptions } from './schema-options';
import { IResourceModel, ModelDocumentType } from '@core/types';


export class ModelFactory<T> {

  private instance: T & IResourceModel;
  private instanceSchema: Schema<T>;
  private instanceModel: Model<ModelDocumentType<T>>;
  private tConstructor: new () => T & IResourceModel;

  /**
   * Creates an instance of ModelFactory.
   *
   * @param {(new () => T & IResourceModel & Typegoose)} tConstructor Model class constructor
   */
  constructor(tConstructor: new () => T & IResourceModel) {
    this.tConstructor = tConstructor;
    this.instance = new this.tConstructor();
  }

  /**
   * Generate a mongoose model based on instance class
   *
   * @returns {Model<ModelDocumentType<T>, {}>}
   */
  public getModel(): Model<ModelDocumentType<T>, {}> {
    if (this.instanceModel) { return this.instanceModel; }

    const collectionName = this.instance.constructor.name;
    const schema = this.instanceSchema || this.getSchema();
    this.instanceModel = model<ModelDocumentType<T>>(collectionName, schema, collectionName);

    return this.instanceModel;
  }

  /**
   * Generates a mongoose schema based on instance class
   *
   * @returns {Schema<T>}
   */
  public getSchema(): Schema<T> {
    if (this.instanceSchema) { return this.instanceSchema; }

    // build schema based on typegoose annotations
    this.instanceSchema = buildSchema<T, any>(this.tConstructor, defaultSchemaOptions);

    // Add static method returning readonly properties
    this.instanceSchema.static('getReadonlyProperties', () => this.instance.readonly || []);

    // Add static method returning hidden properties
    this.instanceSchema.static('getHiddenProperties', () => this.instance.hidden || []);

    // set hidden properties of instance
    this.instanceSchema.set('toJSON', {
      virtuals: true,
      transform: (doc, ret, opt) => {
        // ensure that the given properties will never be exposed
        const deleteKeys = this.instance.hidden;

        for (const key of deleteKeys) { delete ret[key]; }

        return ret;
      }
    });

    // add global plugins
    this.instanceSchema.plugin(mongoosePaginate);
    this.instanceSchema.plugin(mongooseUniqueValidator);

    return this.instanceSchema;
  }

}

