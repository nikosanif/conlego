/* tslint:disable */

declare namespace Express {
  export interface Request {
    user?: any;
    token?: any;
    paginationOptions?: any;
    mongooseQueryOptions?: any;
  }
}