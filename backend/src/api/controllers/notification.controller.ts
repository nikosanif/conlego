import { INotification, NotificationModel } from '@app/models';
import { ResourceController } from '@core/utils/resource-controller';

export class NotificationController extends ResourceController<INotification> {

  constructor() {
    super(NotificationModel);
  }

}
