import { config } from '@config';
import { ILoader } from '@core/types';
import { logger } from '@core/utils/logger';
import { DIContainer } from '@core/di-container';
import { OAuth2Server, OAuthClientModel } from '@core/auth/oauth2';

export class AuthLoader implements ILoader {

  public async load(): Promise<void> {
    try {

      // Create default clients for oauth2 from config
      for (const client of config.oauth2.defaultClients) {
        const foundClient = await OAuthClientModel
          .findOne({ id: client.id, secret: client.secret })
          .exec();

        if (!foundClient) { await OAuthClientModel.create(client); }
      }

      // inject oauth2 server as constant value
      DIContainer
        .bind<OAuth2Server>(OAuth2Server)
        .toConstantValue(new OAuth2Server());

    } catch (e) {
      logger.error(`Auth loader error: `, e);
    }
  }

}
