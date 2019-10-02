import 'reflect-metadata';
import { Container } from 'inversify';
import { SocketsService } from './sockets';
import { NotificationsService } from './notifications';

const DIContainer = new Container();


// Register notification service
DIContainer
  .bind<NotificationsService>(NotificationsService)
  .toConstantValue(new NotificationsService('Foo'));

// Register sockets service
DIContainer
  .bind<SocketsService>(SocketsService)
  .toConstantValue(new SocketsService());


export { DIContainer };
