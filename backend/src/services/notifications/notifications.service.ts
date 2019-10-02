import { injectable } from 'inversify';
import { logger } from '@app/utils/logger';


@injectable()
export class NotificationsService {

  private prefix: string;

  constructor(prefixMsg: string) {
    this.prefix = prefixMsg;
  }

  public notifyAll(message: string) {
    logger.debug('-----------------------------');
    logger.debug(`${this.prefix}: ${message}`);
    logger.debug('-----------------------------');
  }

}
