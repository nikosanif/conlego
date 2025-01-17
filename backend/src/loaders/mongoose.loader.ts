import _ from 'lodash';
import { Db } from 'mongodb';
import { connect, ConnectionOptions } from 'mongoose';
import { logger } from '@app/utils/logger';
import { ILoader } from './loader.interface';
import { config } from '@app/config/environment';


export class MongooseLoader implements ILoader {

  /**
   * Try to connect to Mongo DB and returns
   * the mongodb.Db instance, set when the connection is opened
   *
   * @returns {Promise<Db>}
   */
  public async load(): Promise<Db> {
    try {
      // set default options of mongo client
      const defaultOptions: ConnectionOptions = {
        useNewUrlParser: true,            // make all connections set the useNewUrlParser option
        useFindAndModify: false,          // use native `findOneAndUpdate()` rather than `findAndModify()`
        useCreateIndex: true,             // Automatic index builds
        autoIndex: false,                 // Don't build indexes
        reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
        reconnectInterval: 1000,          // Reconnect every 1s
        bufferMaxEntries: 0,              // Fail when the driver is not connected
        connectTimeoutMS: 10000,          // Give up initial connection after 10 seconds
        socketTimeoutMS: 45000,           // Close sockets after 45 seconds of inactivity
        family: 4,                        // Use IPv4, skip trying IPv6
        useUnifiedTopology: true          // Use the new Server Discover and Monitoring engine
      };

      // merge default options with config mongo options
      const options = _.merge(defaultOptions, config.mongo.options);

      // Connect to DB
      const connection = await connect(config.mongo.uri, options);
      return connection.connection.db;

    } catch (e) {
      logger.error(`Mongoose Loader error: `, e);
      throw e;
    }
  }

}
