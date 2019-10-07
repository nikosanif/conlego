import { SocketServer } from './socket-server';


export class SocketsService {

  private socketServer: SocketServer;

  constructor(socketServer: SocketServer) {
    this.socketServer = socketServer;
  }

  /**
   * Broadcast event to all
   *
   * @param {string} event
   * @param {*} message
   * @returns
   */
  public broadcast(event: string, message: any) {
    this.socketServer.io.emit('server:event', event, message);
  }

}
