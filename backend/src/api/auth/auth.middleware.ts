import { Request, Response, NextFunction } from 'express';


/**
 * Authenticates a request and attaches the user object to the request if authenticated
 */
export function isAuthenticated() {
  return (req: Request, res: Response, next: NextFunction) => {
    const oauth2Server = req.app.get('oauth2Server');
    return oauth2Server.authenticate()(req, res, next);
  };
}

/**
 * Authorizes a token request.
 */
export function isAuthorized() {
  return (req: Request, res: Response, next: NextFunction) => {
    const oauth2Server = req.app.get('oauth2Server');
    return oauth2Server.authorize()(req, res, next);
  };
}

/**
 * Checks if the user role meets the minimum requirements of the route
 *
 * @export
 * @param {string} roleRequired
 * @returns
 */
export function hasRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const oauth2Server = req.app.get('oauth2Server');
    return oauth2Server.hasRole(role)(req, res, next);
  };
}

