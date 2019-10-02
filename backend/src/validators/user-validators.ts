import { Types } from 'mongoose';
import { Request } from 'express';
import { body, ValidationChain } from 'express-validator';
import { unique } from './generic-validators';
import { UserModel } from '@app/models';

/**
 * Validation chain for create scenario of user
 *
 * @export
 * @param {Request} req
 * @returns {ValidationChain[]}
 */
export function createScenario(req: Request): ValidationChain[] {

  return [
    body('firstName')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage({ code: 'required', message: 'The :attribute is required' })
      .isString()
      .withMessage({ code: 'string', message: 'The :attribute must be a string' }),

    body('lastName')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage({ code: 'required', message: 'The :attribute is required' })
      .isString()
      .withMessage({ code: 'string', message: 'The :attribute must be a string' }),

    body('email')
      .exists({ checkFalsy: true })
      .withMessage({ code: 'required', message: 'The :attribute is required' })
      .isEmail()
      .withMessage({ code: 'email', message: 'The :attribute must be a valid email address' })
      .normalizeEmail()
      .custom(unique(UserModel, 'email')),

    body('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
  ];
}

/**
 * Validation chain for update scenario of user
 *
 * @export
 * @param {Request} req
 * @returns {ValidationChain[]}
 */
export function updateScenario(req: Request): ValidationChain[] {

  return [
    body('firstName')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage({ code: 'required', message: 'The :attribute is required' })
      .isString()
      .withMessage({ code: 'string', message: 'The :attribute must be a string' }),

    body('lastName')
      .trim()
      .exists({ checkFalsy: true })
      .withMessage({ code: 'required', message: 'The :attribute is required' })
      .isString()
      .withMessage({ code: 'string', message: 'The :attribute must be a string' }),

    body('email')
      .exists({ checkFalsy: true })
      .withMessage({ code: 'required', message: 'The :attribute is required' })
      .isEmail()
      .withMessage({ code: 'email', message: 'The :attribute must be a valid email address' })
      .normalizeEmail()
      .custom(unique(UserModel, 'email', { _id: { $ne: new Types.ObjectId(req.params.id) } })),

    body('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
  ];
}
