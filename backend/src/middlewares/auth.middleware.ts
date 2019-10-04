import { Request, Response, NextFunction } from 'express';
import { DIContainer } from '@core/di-container';
import { OAuth2Server } from '@core/auth/oauth2';

/**
 * Authenticates a request and attaches
 * the user object to the request if authenticated.
 *
 * @export
 */
export function AuthenticatedMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => DIContainer
    .get(OAuth2Server)
    .authenticate()(req, res, next);
}

/**
 * Authorizes a token request.
 *
 * @export
 */
export function AuthorizedMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => DIContainer
    .get(OAuth2Server)
    .authorize()(req, res, next);
}

/**
 * Checks if the user role meets
 * the minimum requirements of the route
 *
 * @export
 * @param {string} role
 * @returns
 */
export function HasRoleMiddleware(role: string) {
  return (req: Request, res: Response, next: NextFunction) => DIContainer
    .get(OAuth2Server)
    .hasRole(role)(req, res, next);
}
