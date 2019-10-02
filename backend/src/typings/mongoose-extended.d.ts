/* tslint:disable */

declare module 'mongoose' {
  interface Document {
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface ResourceModel<T extends Document> extends Model<T> {
    getReadonlyProperties(): string[];
    getHiddenProperties(): string[];
  }

}
