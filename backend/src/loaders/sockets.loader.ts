import http from 'http';
import { logger } from '@app/utils/logger';
import { ILoader } from './loader.interface';
import { DIContainer, SocketsService } from '@app/services';


export class SocketsLoader implements ILoader {

  /**
   * Initialize socket server and with DI
   *
   * @param {http.Server} server
   * @returns {Promise<void>}
   */
  public async load(server: http.Server): Promise<void> {
    try {
      // Start socket server
      const socketService = DIContainer.get(SocketsService);
      await socketService.start(server);

    } catch (e) {
      logger.error(`Sockets loader error: `, e);
      throw e;
    }
  }
}

