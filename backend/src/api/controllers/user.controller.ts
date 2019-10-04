import { NO_CONTENT } from 'http-status-codes';
import { NotFound, BadRequest } from 'http-errors';
import { Request, Response, Router, NextFunction } from 'express';
import { IUser, UserModel } from '@app/models';
import { ICrudRouteOptions } from '@core/types';
import { AuthenticatedMiddleware } from '@core/middlewares';
import { ResourceController } from '@core/resource-controller';

/**
 * User Controller
 *
 * GET /user/me           Get my profile
 * PUT /user/me           Update my profile
 * PATCH /user/me         Update my profile
 * PUT /user/me/password  Change my password
 *
 * GET /user              Get all models
 * POST /user             Create new model
 * GET /user/:id          Get model
 * PUT /user/:id          Update model
 * PATCH /user/:id        Update model
 * DELETE /user/:id       Delete model
 *
 * @export
 * @class UserController
 * @extends {ResourceController<IUser>}
 */
export class UserController extends ResourceController<IUser> {

  constructor() {
    super(UserModel);
  }

  // #region Methods for myself

  /**
   * Get myself based on authentication
   */
  public me() {
    return async (req: Request, res: Response): Promise<Response> => {
      return this.show(req.user._id)(req, res);
    };
  }

  /**
   * Update my profile
   */
  public updateMe() {
    return async (req: Request, res: Response): Promise<Response> => {
      return this.update(req.user._id)(req, res);
    };
  }

  /**
   * Update password of authenticated user
   */
  public changePassword() {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
      try {
        const oldPassword: string = req.body.oldPassword;
        const newPassword: string = req.body.newPassword;

        const user = await this.modelSchema
          .findById(req.user._id)
          .select('+password +salt')
          .orFail(new NotFound())
          .exec();

        // validate old password
        if (!user.authenticate(oldPassword)) {
          throw new BadRequest('Old password is not correct');
        }

        // save new password
        user.password = newPassword;
        await user.save();

        return res
          .sendStatus(NO_CONTENT);

      } catch (e) {
        next(e);
      }
    };
  }

  // #endregion Methods for myself
  // --------------------------------------

  /**
   * Override routes with custom methods
   *
   * @param {ICrudRouteOptions[]} [options]
   * @returns {Router}
   */
  public applyRoutes(options?: ICrudRouteOptions[]): Router {
    const router = Router();

    router
      .get('/me', AuthenticatedMiddleware(), this.me())
      .put('/me', [AuthenticatedMiddleware()], this.updateMe())
      .patch('/me', [AuthenticatedMiddleware()], this.updateMe())
      .put('/me/password', AuthenticatedMiddleware(), this.changePassword());

    // override crud routes with auth middleware
    options = [
      { operation: 'create', middleware: [] },
      { operation: 'index', middleware: [AuthenticatedMiddleware()] },
      { operation: 'show', middleware: [AuthenticatedMiddleware()] },
      { operation: 'update', middleware: [AuthenticatedMiddleware()] },
      { operation: 'delete', middleware: [AuthenticatedMiddleware()] },
    ];
    router.use(super.applyRoutes(options));

    return router;
  }

}
