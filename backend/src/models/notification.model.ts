import { prop } from '@typegoose/typegoose';
import { ModelFactory } from '@core/model-factory';
import { IResourceModel, ModelDocumentType } from '@core/types';


class Notification implements IResourceModel {

  public hidden: string[] = [];
  public readonly: string[] = [];

  @prop({ required: true })
  public title: string;

  @prop()
  public message?: string;

}


export interface INotification extends ModelDocumentType<Notification> { }
export const NotificationModel = new ModelFactory<Notification>(Notification).getModel();
