import { AuthorizationCode } from 'oauth2-server';
import { Model, Schema, model, Document } from 'mongoose';
import { IUser } from '@app/models';
import { IOAuthClient } from './oauth-client.model';

export interface IOAuthCode extends Document, AuthorizationCode {
  authorizationCode: string;
  expiresAt: Date;
  redirectUri: string;
  client: IOAuthClient;
  user: IUser;
  scope?: string[];
}

const OAuthCodesSchema = new Schema({
  authorizationCode:  { type: String, required: true },
  expiresAt:          { type: Date, required: true },
  redirectUri:        { type: String, required: true },
  client:             { type: Schema.Types.ObjectId, ref: 'OAuthClients', required: true },
  user:               { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scope:              { type: [{ type: String }], required: false, default: [] },

}, { timestamps: true, versionKey: false });

export const OAuthCodeModel: Model<IOAuthCode> = model<IOAuthCode>(
  'OAuthCodes', OAuthCodesSchema, 'OAuthCodes'
);
