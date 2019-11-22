import { Request, Response, NextFunction } from 'express';
import {  UserSchema, User } from '@app/models';
import { logger } from '@app/core/utils/logger';
import { jsonValidator, mongooseValidator } from '@app/validators';
import { getErrorBody } from '@app/core/middlewares';
import { UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { mongoose } from '@typegoose/typegoose';

export function UserValidator(): any {
    return async(req: Request, res: Response, next: NextFunction) => {
        try {
            const JsonShema: any = jsonValidator.mongooseShemaToJsonShema(UserSchema, User.name);
            // default mongoose validation
            // -------------------- JSON SHEMA VALIDATION Again------------------------
            const compiledShema = jsonValidator.JSCompile(JsonShema);
            if (!jsonValidator.isJSValid(compiledShema, req.body)) {
                return next(getErrorBody(UNPROCESSABLE_ENTITY, compiledShema.errors));
            }
            // ------------------------------------------------------------------------
            // -------------------- MONGOOSE SHEMA VALIDATION -------------------------
            // -------------------- EXISTS VALIDATOR ----------------------------------
            await mongooseValidator.checkSchemaExists(JsonShema, req.body, next);
            // ------------------------------------------------------------------------
            // -------------------- UNIQUE VALIDATOR ----------------------------------
            await mongooseValidator.checkUnique(JsonShema, req.body, ['email'], next );
            // ------------------------------------------------------------------------
            // ------------------------------------------------------------------------
            next();
        } catch (e) {
            next(e);
        }
    };
}

