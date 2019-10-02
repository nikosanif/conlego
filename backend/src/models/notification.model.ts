import { prop, Typegoose } from '@hasezoey/typegoose';
import { ModelFactory, ModelDocumentType, IResourceModel } from '@app/models/shared';


class Notification extends Typegoose implements IResourceModel {

  public hidden: string[] = [];
  public readonly: string[] = [];

  @prop({ required: true })
  public title: string;

  @prop()
  public message?: string;

}


export interface INotification extends ModelDocumentType<Notification> { }
export const NotificationModel = new ModelFactory<Notification>(Notification).getModel();
