import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { UnprocessableEntity } from 'http-errors';

/**
 * Validates request based on a validation chain
 *
 * @export
 * @param {(req: Request) => ValidationChain[]} rulesCallback
 * @returns
 */
export function validate(rulesCallback: (req: Request) => ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {

    const rules = rulesCallback(req);

    await Promise.all(rules.map(validation => validation.run(req)));

    const errors = validationResult(req).formatWith(errorFormatter);

    if (errors.isEmpty()) {
      return next();
    }

    const httpError = new UnprocessableEntity('Validation exception');
    httpError.errors = errors.array();
    httpError.code = 'ValidationError';

    return next(httpError);
  };
}

/**
 * Unifies the error format of validations
 *
 * @param {*} error
 * @returns
 */
function errorFormatter(error: any) {
  const { msg, location, param, value } = error;

  const code = (typeof msg === 'object') ? msg.code : 'error';
  const template = (typeof msg === 'object') ? msg.message : msg;

  const message = template
    .replace(':attribute', param)
    .replace(':value', value);

  return { param, code, message, location };
}
