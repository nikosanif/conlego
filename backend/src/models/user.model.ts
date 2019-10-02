import crypto from 'crypto';
import { pre, prop, instanceMethod, Typegoose } from '@hasezoey/typegoose';
import { ModelFactory, ModelDocumentType, IResourceModel } from '@app/models/shared';


@pre<User>('save', async function (next) {
  // Handle new/update passwords
  if (!this.isModified('password')) { return; }

  // validate presence of password
  if (!(this.password && this.password.length)) {
    throw new Error('Invalid password');
  }

  this.salt = await this.makeSalt();
  this.password = this.encryptPassword(this.password);
})
class User extends Typegoose implements IResourceModel {

  public hidden: string[] = ['password', 'salt'];
  public readonly: string[] = ['password', 'salt'];

  // ------------------------------------------
  // #region Instance properties

  @prop({ required: true })
  public firstName: string;

  @prop({ required: true })
  public lastName: string;

  @prop({
    required: true,
    unique: true,
  })
  public email: string;

  @prop({ required: true })
  public password: string;

  @prop()
  public salt?: string;

  @prop()
  public role?: string;

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
  @instanceMethod
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
  @instanceMethod
  public authenticate(password: string) {
    return this.password === this.encryptPassword(password);
  }

  /**
   * Generates salt string
   *
   * @param {number} [byteSize=16]
   * @returns {Promise<string>}
   */
  @instanceMethod
  public makeSalt(byteSize: number = 16): Promise<string> {
    return new Promise((resolve, reject) => {

      crypto.randomBytes(byteSize, (err, salt) => {
        if (err) { return reject(err); }

        return resolve(salt.toString('base64'));
      });

    });
  }

  // #endregion Instance Methods
  // ------------------------------------------

}


export interface IUser extends ModelDocumentType<User> { }
export const UserModel = new ModelFactory<User>(User).getModel();
