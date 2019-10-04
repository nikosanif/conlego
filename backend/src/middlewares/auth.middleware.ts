import { Request, Response, NextFunction, RequestHandler } from 'express';
import { DIContainer } from '@core/di-container';
import { OAuth2Server } from '@core/auth/oauth2';

/**
 * Authenticates a request and attaches
 * the user object to the request if authenticated.
 *
 * @export
 * @returns {RequestHandler}
 */
export function AuthenticatedMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => DIContainer
    .get(OAuth2Server)
    .authenticate()(req, res, next);
}

/**
 * Authorizes a token request.
 *
 * @export
 * @returns {RequestHandler}
 */
export function AuthorizedMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => DIContainer
    .get(OAuth2Server)
    .authorize()(req, res, next);
}

/**
 * Validates a given token
 *
 * @export
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export function ValidateAccessTokenMiddleware(token: string): Promise<boolean> {
  return DIContainer
    .get(OAuth2Server)
    .validateAccessToken(token);
}
