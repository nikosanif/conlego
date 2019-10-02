import * as jwt from 'jsonwebtoken';
import {
  PasswordModel, Falsey, RefreshTokenModel,
  ClientCredentialsModel, AuthorizationCodeModel
} from 'oauth2-server';
import { UserModel, IUser } from '@app/models';
import { config } from '@app/config/environment';
import { OAuthTokens, IOAuthToken } from './oauth-token.model';
import { OAuthClients, IOAuthClient } from './oauth-client.model';
import { OAuthCodes, IOAuthCode } from './oauth-authorization-code.model';


class Oauth2Model implements PasswordModel, RefreshTokenModel, ClientCredentialsModel, AuthorizationCodeModel {


  //#region Token methods

  /**
   * Generate access token with JWT
   *
   * @param {IOAuthClient} client
   * @param {IUser} user
   * @param {string[]} scope
   * @returns {Promise<string>}
   */
  public async generateAccessToken(client: IOAuthClient, user: IUser, scope: string[]): Promise<string> {
    // logger.debug('generateAccessToken');

    return jwt.sign(
      { userId: user._id, clientId: client._id, role: user.role, scope },
      config.oauth2.secrets.accessToken
    );
  }

  /**
   * Generate refresh token with JWT
   *
   * @param {IOAuthClient} client
   * @param {IUser} user
   * @param {string[]} scope
   * @returns {Promise<string>}
   */
  public async generateRefreshToken(client: IOAuthClient, user: IUser, scope: string[]): Promise<string> {
    // logger.debug('generateRefreshToken');

    return jwt.sign(
      { userId: user._id, clientId: client._id, role: user.role, scope },
      config.oauth2.secrets.refreshToken
    );
  }

  /**
   * Save tokens to DB
   *
   * @param {IOAuthToken} token
   * @param {IOAuthClient} client
   * @param {IUser} user
   * @returns {(Promise<IOAuthToken | Falsey>)}
   */
  public async saveToken(token: IOAuthToken, client: IOAuthClient, user: IUser): Promise<IOAuthToken | Falsey> {
    // logger.debug('saveToken');

    token.user = user;
    token.client = client;
    token.refreshToken = token.refreshToken || await this.generateRefreshToken(client, user, token.scope);

    return await OAuthTokens
      .create(token);
  }

  /**
   * Get access token from DB
   *
   * @param {string} accessToken
   * @returns {(Promise<IOAuthToken | Falsey>)}
   */
  public async getAccessToken(accessToken: string): Promise<IOAuthToken | Falsey> {
    // logger.debug('getAccessToken');

    try {
      const decodedToken = jwt
        .verify(accessToken, config.oauth2.secrets.accessToken) as { userId: string, clientId: string };

      return await OAuthTokens
        .findOne({ accessToken, user: decodedToken.userId, client: decodedToken.clientId })
        .populate('user client');

    } catch (e) {
      return false;
    }
  }

  /**
   * Get refresh token from DB
   *
   * @param {string} refreshToken
   * @returns {(Promise<IOAuthToken | Falsey>)}
   */
  public async getRefreshToken(refreshToken: string): Promise<IOAuthToken | Falsey> {
    // logger.debug('getRefreshToken');

    try {
      const decodedToken = jwt
        .verify(refreshToken, config.oauth2.secrets.refreshToken) as { userId: string, clientId: string };

      return await OAuthTokens
        .findOne({ refreshToken, user: decodedToken.userId, client: decodedToken.clientId })
        .populate('user client');

    } catch (e) {
      return false;
    }
  }

  /**
   * Delete token from DB
   *
   * @param {IOAuthToken} token
   * @returns {Promise<boolean>}
   */
  public async revokeToken(token: IOAuthToken): Promise<boolean> {
    // logger.debug('revokeToken');

    try {
      await OAuthTokens
        .deleteOne({ _id: token._id })
        .orFail();

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Delete multiple tokens from DB
   *
   * @param {IOAuthToken} token
   * @param {('all' | 'allButCurrent' | 'current')} clients
   * @returns
   */
  public async revokeMultipleTokens(token: IOAuthToken, clients: 'all' | 'allButCurrent' | 'current') {
    // logger.debug('revokeMultipleTokens');

    try {

      if (clients === 'current') {
        // delete only current token

        await OAuthTokens
          .deleteOne({ _id: token._id })
          .orFail();

      } else if (clients === 'all') {
        // delete all tokens of user

        await OAuthTokens
          .deleteMany({ user: token.user._id });

      } else if (clients === 'allButCurrent') {
        // delete all tokens of user except current

        await OAuthTokens
          .deleteMany({
            _id: { $not: { $eq: token._id } },
            user: token.user._id,
          });
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  //#endregion Token methods
  // ------------------------------------------


  //#region User methods

  /**
   * Get user and authenticate password
   *
   * @param {string} email
   * @param {string} password
   * @returns {(Promise<IUser | Falsey>)}
   */
  public async getUser(email: string, password: string): Promise<IUser | Falsey> {
    // logger.debug('getUser');

    const user = await UserModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password +salt'); // select password, salt to verify password

    // check if user exists
    if (!user) { return false; }

    // check if passwords match
    if (!user.authenticate(password)) { return false; }

    return user;
  }

  /**
   * Get issuer from client
   *
   * @param {IOAuthClient} client
   * @returns {(Promise<IUser | Falsey>)}
   * @memberof Oauth2Model
   */
  public async getUserFromClient(client: IOAuthClient): Promise<IUser | Falsey> {
    // logger.debug('getUserFromClient');

    return client.user;
  }

  //#endregion User methods
  // ------------------------------------------


  //#region Client methods

  /**
   * Get client from its id and secret
   *
   * @param {string} clientId
   * @param {string} clientSecret
   * @returns {(Promise<IOAuthClient | Falsey>)}
   */
  public async getClient(clientId: string, clientSecret: string): Promise<IOAuthClient | Falsey> {
    // logger.debug('getClient');

    return await OAuthClients
      .findOne({ id: clientId, secret: clientSecret })
      .populate('user');
  }

  //#endregion Client methods
  // ------------------------------------------


  public async verifyScope(token: IOAuthToken, scope: string[]): Promise<boolean> {
    // logger.debug('verifyScope');

    return false;
  }

  public async getAuthorizationCode(authorizationCode: string): Promise<IOAuthCode | Falsey> {
    // logger.debug('getAuthorizationCode');

    return await OAuthCodes
      .findOne({ authorizationCode })
      .populate('user client');
  }

  public async saveAuthorizationCode(
    code: IOAuthCode,
    client: IOAuthClient,
    user: IUser
  ): Promise<IOAuthCode | Falsey> {
    // logger.debug('saveAuthorizationCode');

    code.user = user;
    code.client = client;

    return await OAuthCodes
      .create(code);
  }

  public async revokeAuthorizationCode(code: IOAuthCode): Promise<boolean> {
    // logger.debug('revokeAuthorizationCode');

    try {
      await OAuthCodes
        .deleteOne({ _id: code._id })
        .orFail();

      return true;
    } catch (e) {
      return false;
    }
  }

}

export const oauth2Model = new Oauth2Model();
