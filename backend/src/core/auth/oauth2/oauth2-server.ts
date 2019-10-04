import express from 'express';
import { HttpError, Forbidden, BadRequest } from 'http-errors';
import oauth2Server, { UnauthorizedRequestError } from 'oauth2-server';
import { Oauth2Model } from './models/oauth2.model';

const Request = oauth2Server.Request;
const Response = oauth2Server.Response;


export class OAuth2Server {

  public server: oauth2Server;

  private readonly ACCESS_TOKEN_LIFETIME = 60 * 60 * 24 * 1;    // 1 day.
  private readonly REFRESH_TOKEN_LIFETIME = 60 * 60 * 24 * 7;   // 7 days.

  private oauth2Model: Oauth2Model;
  private useErrorHandler: boolean;
  private continueMiddleware: boolean;

  constructor() {
    this.useErrorHandler = true; // use global express error handler
    this.continueMiddleware = false;
    this.oauth2Model = new Oauth2Model();
    this.server = new oauth2Server({ model: this.oauth2Model });
  }

  //#region Public methods

  /**
   * Authenticates a request.
   */
  public authenticate() {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const request = new Request(req);
      const response = new Response(res);
      const options: oauth2Server.AuthenticateOptions = {
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
      const options: oauth2Server.AuthorizeOptions = {};

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
      const options: oauth2Server.AuthenticateOptions = {
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
      const options: oauth2Server.TokenOptions = {
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
      const options: oauth2Server.AuthenticateOptions = {
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

        const isDeleted = await this.oauth2Model.revokeMultipleTokens(token as any, clients);

        if (!isDeleted) { throw new BadRequest(); }

        return this.handleResponse(req, res, response);
      } catch (e) {
        return this.handleError(e, req, res, response, next);
      }
    };
  }

  //#endregion Public methods
  // ------------------------------------------

  //#region Private methods

  /**
   * Handle response of oauth2 server
   *
   * @private
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {*} response
   */
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

  /**
   * Handle error of oauth2 server
   *
   * @private
   * @param {HttpError} e
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {*} response
   * @param {express.NextFunction} next
   * @returns
   */
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

  //#endregion Private methods
  // ------------------------------------------

}
