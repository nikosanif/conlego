import 'module-alias/register';

import { Server } from './server';
import { logger } from './utils/logger';


async function bootstrap() {
  try {
    const server = new Server();
    await server.start();

  } catch (e) {
    logger.error(`Failed to start server due to error: `, e);
    process.exit(-1);
  }
}

bootstrap();
