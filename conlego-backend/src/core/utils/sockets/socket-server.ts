import http from 'http';
import io from 'socket.io';
import RedisAdapter from 'socket.io-redis';
import { logger } from '@core/utils/logger';
import { config, getHostDomain } from '@config';
import { SocketIOAuthMiddleware } from '@core/middlewares';


export class SocketServer {

  public io: io.Server;

  constructor() { }

  /**
   * Start the Socket Server.
   *
   * @param {http.Server} server
   */
  public async start(server: http.Server) {
    try {
      // create redis adapter for sockets.io
      const redisAdapter = RedisAdapter({
        host: config.redis.host,
        port: Number(config.redis.port),
        auth_pass: config.redis.password
      });

      // create socket io server
      this.io = io(server, { path: config.sockets.path });

      // attach redis adapter
      this.io.adapter(redisAdapter);

      // log adapter errors
      this.io
        .of('/').adapter
        .on('error', (e: Error) => {
          logger.error('Socket server failed due to: ', e);
        });

      // add authentication middleware
      this.io.use(SocketIOAuthMiddleware);

      // register events on connect
      this.onConnect();

      logger.info(`Sockets are established on path: ${getHostDomain()}${config.sockets.path}`);

    } catch (e) {
      logger.error('Socket server failed to start', e);
    }
  }

  //#region Private methods

  /**
   * On server connection.
   */
  private onConnect() {
    this.io.on('connection', socket => {
      logger.debug(`[sockets] connection`);
      logger.debug(`[sockets] Welcome, ${socket.user.firstName} ${socket.user.lastName}!`);

      this.onSubscribe(socket);
      this.onUnsubscribe(socket);
      this.onDisconnecting(socket);
      this.onClientEvent(socket);
    });
  }

  /**
   * On subscribe to a channel.
   *
   * @param {io.Socket} socket
   */
  private onSubscribe(socket: io.Socket): void {
    socket.on('subscribe', (data: any) => {
      logger.debug('[sockets] subscribe');
    });
  }

  /**
   * On unsubscribe from a channel.
   *
   * @param {io.Socket} socket
   */
  private onUnsubscribe(socket: io.Socket): void {
    socket.on('unsubscribe', (data: any) => {
      logger.debug('[sockets] unsubscribe');
    });
  }

  /**
   * On socket disconnecting.
   *
   * @param {io.Socket} socket
   */
  private onDisconnecting(socket: io.Socket): void {
    socket.on('disconnecting', (reason: any) => {
      logger.debug('[sockets] disconnecting');
    });
  }

  /**
   * On client events.
   *
   * @param {io.Socket} socket
   */
  private onClientEvent(socket: io.Socket): void {
    socket.on('client:event', (data: any) => {
      logger.debug('[sockets] client event');
    });
  }

  //#endregion Private methods
  // --------------------------------

}

