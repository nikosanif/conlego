import io from 'socket.io';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { IUser } from '@app/models';
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
 * and returns the user
 *
 * @export
 * @param {string} token
 * @returns {Promise<IUser>}
 */
export async function GetUserFromAccessToken(token: string): Promise<IUser> {
  return DIContainer
    .get(OAuth2Server)
    .getUserFromAccessToken(token);
}

/**
 * Implements authentication middleware that
 * checks validity of the given access token
 *
 * @export
 * @param {io.Socket} socket
 * @param {(err?: any) => void} next
 */
export async function SocketIOAuthMiddleware(socket: io.Socket, next: (err?: any) => void) {
  try {
    const connectedUser = await DIContainer
      .get(OAuth2Server)
      .getUserFromAccessToken(socket.handshake.query.token);

    // check validity of token
    if (!connectedUser) { return next(new Error('Authentication error')); }

    // attach user to socket
    socket.user = connectedUser;
    next();

  } catch (e) {
    next(e);
  }
}
