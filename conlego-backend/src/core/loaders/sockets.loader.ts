import http from 'http';
import { ILoader } from '@core/types';
import { logger } from '@core/utils/logger';
import { DIContainer } from '@core/di-container';
import { SocketServer, SocketsService } from '@core/utils/sockets';

export class SocketsLoader implements ILoader {

  /**
   * Starts socket server and dependency
   * injection of sockets service
   *
   * @param {http.Server} server
   * @returns {Promise<void>}
   */
  public async load(server: http.Server): Promise<void> {
    try {

      // start sockets server
      const socketServer = new SocketServer();
      await socketServer.start(server);

      // inject sockets service as constant value
      DIContainer
        .bind<SocketsService>(SocketsService)
        .toConstantValue(new SocketsService(socketServer));

    } catch (e) {
      logger.error(`Sockets loader error: `, e);
    }
  }

}
