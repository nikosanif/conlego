import http from 'http';
import express from 'express';
import { Db } from 'mongodb';
import { logger } from './utils/logger';
import { config, getHostDomain } from './config/environment';
import { MongooseLoader, ExpressLoader, SocketsLoader } from './loaders';


export class Server {

  public dbConnection: Db;
  public app: express.Application;

  constructor() { }

  /**
   * Initializes application and starts the server
   */
  public start() {
    return new Promise<void>(async (resolve, reject) => {
      try {

        // Setup and connect database
        this.dbConnection = await new MongooseLoader().load();

        // Setup express and API routes
        this.app = await new ExpressLoader().load();
        const server = http.createServer(this.app);

        // Start socket server
        await new SocketsLoader().load(server);


        // Register server events
        server.on('error', (error: any) => reject(error));
        server.on('listening', () => {
          logger.info(`Server started in "${config.environment}" mode. Available on: ${getHostDomain()}`);
          return resolve();
        });

        // Finally start server
        server.listen(config.port);

      } catch (e) {
        return reject(e);
      }
    });
  }

}
