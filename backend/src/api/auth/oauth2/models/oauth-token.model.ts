import { Token, RefreshToken } from 'oauth2-server';
import { Model, Schema, model, Document } from 'mongoose';
import { IUser } from '@app/models';
import { IOAuthClient } from './oauth-client.model';

export interface IOAuthToken extends Document, Token, RefreshToken {
  accessToken: string;
  refreshToken: string;
  client: IOAuthClient;
  user: IUser;
  scope?: string[];
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresOn?: Date;
}

const OAuthTokensSchema = new Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  client: { type: Schema.Types.ObjectId, ref: 'OAuthClients', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scope: { type: [{ type: String }], required: false, default: [] },
  accessTokenExpiresAt: { type: Date, required: false, },
  refreshTokenExpiresAt: { type: Date, required: false, },
});

export const OAuthTokens: Model<IOAuthToken> = model<IOAuthToken>(
  'OAuthTokens', OAuthTokensSchema, 'OAuthTokens'
);
