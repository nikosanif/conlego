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

    // attach pagination options
    // as they are declared at:
    // https://www.npmjs.com/package/mongoose-paginate-v2
    req.paginationOptions = {
      query: queryOptions.filter,
      options: {
        select: queryOptions.select,
        sort: queryOptions.sort,
        populate: queryOptions.populate,
        page: queryOptions.skip || 1,
        lean: false,
        leanWithId: false,
        limit: queryOptions.limit || 10,
      }
    };

    next();
  };
}
