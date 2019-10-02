/**
 * Auth routes file
 *
 * POST /login                        Login with grand types
 * GET /logout                        Revoke only current token
 * GET /logout?clients=all            Revoke all tokens
 * GET /logout?clients=allButCurrent  Revoke all tokens except current
 */


import { Router } from 'express';

const oauthRouter: Router = Router();

// Retrieves a new token for an authorized token request.
oauthRouter.post('/login', (req, res, next) => {
  const oauth2Server = res.app.get('oauth2Server');
  return oauth2Server.retrieveToken()(req, res, next);
});

// Revoke (delete) current token
oauthRouter.get('/logout', (req, res, next) => {
  const oauth2Server = res.app.get('oauth2Server');
  return oauth2Server.deleteToken()(req, res, next);
});

export const router = oauthRouter;
