import { Model, model, Schema, SchemaOptions } from 'mongoose';
import { buildSchema, addModelToTypegoose } from '@typegoose/typegoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import { defaultSchemaOptions } from './schema-options';
import { IResourceModel, ModelDocumentType } from '@core/types';


export class ModelFactory<T> {

  private collectionName: string;
  private instanceSchema: Schema<T>;
  private instance: T & IResourceModel;
  private schemaOptions: SchemaOptions;
  private instanceModel: Model<ModelDocumentType<T>>;
  private tConstructor: new () => T & IResourceModel;

  /**
   * Creates an instance of ModelFactory.
   *
   * @param {(new () => T & IResourceModel)} tConstructor
   * @param {SchemaOptions} schemaOptions
   */
  constructor(
    tConstructor: new () => T & IResourceModel,
    schemaOptions: SchemaOptions = {}
  ) {
    this.tConstructor = tConstructor;
    this.schemaOptions = schemaOptions;
    this.instance = new this.tConstructor();
    this.collectionName = this.instance.constructor.name;
  }

  /**
   * Generate a mongoose model based on instance class
   *
   * @returns {Model<ModelDocumentType<T>, {}>}
   */
  public getModel(): Model<ModelDocumentType<T>, {}> {
    if (this.instanceModel) { return this.instanceModel; }

    const schema = this.instanceSchema || this.getSchema();
    this.instanceModel = model<ModelDocumentType<T>>(this.collectionName, schema, this.collectionName);

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
    // override default schema options if are provided
    this.instanceSchema = buildSchema<T, any>(
      this.tConstructor,
      {
        ...defaultSchemaOptions,
        collection: this.collectionName,
        ...this.schemaOptions
      }
    );

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

