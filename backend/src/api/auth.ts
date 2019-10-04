import express from 'express';
import { DIContainer } from '@core/di-container';
import { OAuth2Server } from '@core/auth/oauth2';


const authRouter = express.Router();

// Retrieves a new token for an authorized token request.
authRouter.post('/login', (req, res, next) => DIContainer
  .get(OAuth2Server)
  .retrieveToken()(req, res, next));

// Revoke (delete) tokens
authRouter.get('/logout', (req, res, next) => DIContainer
  .get(OAuth2Server)
  .deleteToken()(req, res, next));


export { authRouter };

