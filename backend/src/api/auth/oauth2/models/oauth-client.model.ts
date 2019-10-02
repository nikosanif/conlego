import { Client } from 'oauth2-server';
import { Model, Schema, model, Document } from 'mongoose';
import { IUser } from '@app/models';

export interface IOAuthClient extends Document, Client {
  id: string;
  secret: string;
  grants: string[];
  redirectUris: string[];
  accessTokenLifetime?: number;
  refreshTokenLifetime?: number;
  user?: IUser;
}

const OAuthClientsSchema = new Schema({
  id: { type: String, required: true },
  secret: { type: String, required: true },
  grants: { type: Array, required: true },
  redirectUris: { type: Array, required: true },
  accessTokenLifetime: { type: Number, required: false },
  refreshTokenLifetime: { type: Number, required: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
});

export const OAuthClients: Model<IOAuthClient> = model<IOAuthClient>(
  'OAuthClients', OAuthClientsSchema, 'OAuthClients'
);

