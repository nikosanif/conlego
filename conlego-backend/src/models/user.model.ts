import crypto from 'crypto';
import { pre, prop, index } from '@typegoose/typegoose';
import { ModelFactory } from '@core/utils/model-factory';
import { IResourceModel, ModelDocumentType } from '@core/types';

// ------------------  HOOKS ---------------
@pre<User>('save', handlePasswordChangeHook)
// ------------------  INDEXES -------------
@index({ email: 1 }, { unique: true })
@index({ email: 1, password: -1 })
class User implements IResourceModel {

  public hidden: string[] = ['password', 'salt'];
  public readonly: string[] = ['password', 'salt'];

  // ------------------------------------------
  // #region Instance properties

  @prop({ required: true, maxLength: 35 })
  public firstName: string;

  @prop({ required: true, maxLength: 35 })
  public lastName: string;

  @prop({ required: true, unique: true, maxLength: 35, lowercase: true, trim: true,  match: /^(([^<>()\[\]\\\\.,;:#\s@"]+(\.[^<>()\[\]\\\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ })
  public email: string;

  @prop({ required: true })
  public password: string;

  @prop()
  public salt?: string;

  @prop()
  public role?: string;

  public createdAt: Readonly<Date>;
  public updatedAt: Readonly<Date>;

  // #endregion Instance properties
  // ------------------------------------------

  // ------------------------------------------
  // #region Instance Methods

  /**
   * Encrypt a given password
   *
   * @param {string} password
   * @returns {string}
   */
  public encryptPassword(password: string): string {

    // Settings https://cryptosense.com/blog/parameter-choice-for-pbkdf2/
    const defaultIterations = 10000;
    const defaultKeyLength = 64;
    const salt = Buffer.from(this.salt, 'base64');
    const digest = 'sha512';

    return crypto
      .pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, digest)
      .toString('base64');
  }

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {string} password
   * @returns
   */
  public authenticate(password: string) {
    return this.password === this.encryptPassword(password);
  }

  /**
   * Generates salt string
   *
   * @param {number} [byteSize=16]
   * @returns {Promise<string>}
   */
  public makeSalt(byteSize: number = 16): Promise<string> {
    return new Promise((resolve, reject) => {

      crypto.randomBytes(byteSize, (err: any, salt: any) => {
        if (err) { return reject(err); }

        return resolve(salt.toString('base64'));
      });

    });
  }

  // #endregion Instance Methods
  // ------------------------------------------

}

/**
 * Pre save hook for handling password changes
 */
async function handlePasswordChangeHook(next: (...args: any[]) => void) {
  // Handle new/update passwords
  if (!this.isModified('password')) { return; }

  // validate presence of password
  if (!(this.password && this.password.length)) {
    throw new Error('Invalid password');
  }

  this.salt = await this.makeSalt();
  this.password = this.encryptPassword(this.password);
}


export interface IUser extends ModelDocumentType<User> { }
export const UserModel = new ModelFactory<User>(User).getModel();
