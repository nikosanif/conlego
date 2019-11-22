import { MongooseQueryParser } from 'mongoose-query-parser';
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Middleware for convert url query string to MongooseJs
 * friendly query object including advanced filtering,
 * sorting, population, string template, type casting and many more...
 *
 * @export
 * @param {string} [skipKey='page']
 * @param {string} [limitKey='perPage']
 * @returns {RequestHandler}
 */
export function MongooseQueryParserMiddleware(
  skipKey: string = 'page',
  limitKey: string = 'perPage'
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {

    const queryOptions = new MongooseQueryParser({ limitKey, skipKey })
      .parse(req.query);

    // attach parsed query params
    req.mongooseQueryOptions = queryOptions;

    next();
  };
}
