import * as express from 'express';
import OAuth2Server from 'oauth2-server';
import { HttpError, Forbidden, BadRequest } from 'http-errors';
import { UnauthorizedRequestError } from 'oauth2-server';
import { logger } from '@app/utils/logger';
import { oauth2Model } from './models/oauth2.model';
import { config } from '@app/config/environment';
import { OAuthClients } from './models/oauth-client.model';

const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;


class ExpressOAuthServer {

  public server: OAuth2Server;

  private readonly ACCESS_TOKEN_LIFETIME = 60 * 60 * 24 * 1;    // 1 day.
  private readonly REFRESH_TOKEN_LIFETIME = 60 * 60 * 24 * 7;   // 7 days.

  private useErrorHandler: boolean;
  private continueMiddleware: boolean;

  constructor() {
    this.useErrorHandler = true; // use global express error handler
    this.continueMiddleware = false;

    this.server = new OAuth2Server({ model: oauth2Model });
  }

  /**
   * Authenticates a request.
   */
  public authenticate() {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const request = new Request(req);
      const response = new Response(res);
      const options: OAuth2Server.AuthenticateOptions = {
        addAcceptedScopesHeader: false,
        addAuthorizedScopesHeader: false,
      };

      try {
        const token = await this.server.authenticate(request, response, options);
        res.locals.oauth = { token };
        req.token = token;
        req.user = token.user;
        next();
      } catch (e) {
        return this.handleError(e, req, res, null, next);
      }
    };
  }

  /**
   * Authorizes a token request.
   */
  public authorize() {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const request = new Request(req);
      const response = new Response(res);
      const options: OAuth2Server.AuthorizeOptions = {};

      try {
        const code = await this.server.authorize(request, response, options);
        res.locals.oauth = { code };
        if (this.continueMiddleware) { next(); }

        return this.handleResponse(req, res, response);
      } catch (e) {
        return this.handleError(e, req, res, response, next);
      }
    };
  }

  /**
   * Check if user has valid role
   *
   * @param {string} role
   * @returns
   */
  public hasRole(role: string) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const request = new Request(req);
      const response = new Response(res);
      const options: OAuth2Server.AuthenticateOptions = {
        addAcceptedScopesHeader: false,
        addAuthorizedScopesHeader: false,
      };

      try {
        const token = await this.server.authenticate(request, response, options);
        res.locals.oauth = { token };
        req.token = token;
        req.user = token.user;

        if (token.user.role === role) {
          next();
        } else {
          throw new Forbidden();
        }
      } catch (e) {
        return this.handleError(e, req, res, null, next);
      }
    };
  }

  /**
   * Retrieves a new token for an authorized token request.
   */
  public retrieveToken() {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      // set content-type in order to avoid error of header
      req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      const request = new Request(req);
      const response = new Response(res);
      const options: OAuth2Server.TokenOptions = {
        accessTokenLifetime: this.ACCESS_TOKEN_LIFETIME,
        refreshTokenLifetime: this.REFRESH_TOKEN_LIFETIME
      };

      try {
        const token = await this.server.token(request, response, options);
        res.locals.oauth = { token };
        return this.handleResponse(req, res, response);
      } catch (e) {
        return this.handleError(e, req, res, response, next);
      }
    };
  }

  /**
   * Revoke (delete) current token
   *
   * @returns
   */
  public deleteToken() {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const request = new Request(req);
      const response = new Response(res);
      const options: OAuth2Server.AuthenticateOptions = {
        addAcceptedScopesHeader: false,
        addAuthorizedScopesHeader: false,
      };

      try {
        const token = await this.server.authenticate(request, response, options);

        // revoke current or multiple tokens
        let clients: 'all' | 'allButCurrent' | 'current' = 'current';

        switch (req.query.clients) {
          case 'all':
            clients = 'all';
            break;

          case 'allButCurrent':
            clients = 'allButCurrent';
            break;
        }

        const isDeleted = await oauth2Model.revokeMultipleTokens(token as any, clients);

        if (!isDeleted) { throw new BadRequest(); }

        return this.handleResponse(req, res, response);
      } catch (e) {
        return this.handleError(e, req, res, response, next);
      }
    };
  }

  private handleResponse(req: express.Request, res: express.Response, response: any) {
    if (response.status === 302) {
      const location = response.headers.location;
      delete response.headers.location;

      res.set(response.headers);
      res.redirect(location);
    } else {
      res.set(response.headers);
      res.status(response.status).send(response.body);
    }
  }

  private handleError(
    e: HttpError,
    req: express.Request,
    res: express.Response,
    response: any,
    next: express.NextFunction
  ) {
    if (this.useErrorHandler === true) {
      next(e);
    } else {
      if (response) { res.set(response.headers); }
      res.status(e.code || e.status || 500);
      if (e instanceof UnauthorizedRequestError) {
        return res.send();
      }
      res.send(e);
    }
  }

}


/**
 * Setup auth routes and apply middleware into express
 *
 * @export
 * @param {express.Application} app
 */
export async function setup(app: express.Application) {
  try {
    const auth2Server = new ExpressOAuthServer();

    // Create default clients for oauth2 from config
    const clients: any[] = config.oauth2.defaultClients;

    for (const client of clients) {
      const foundClient = await OAuthClients
        .findOne({ id: client.id, secret: client.secret })
        .exec();

      if (!foundClient) { await OAuthClients.create(client); }
    }

    // add oauth2 middleware to express app
    app.set('oauth2Server', auth2Server);
  } catch (e) {
    logger.error(`Failed to initiate oauth2 server: ${e}`);
  }

}
