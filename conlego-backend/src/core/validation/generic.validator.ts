import { Request, Response, NextFunction } from 'express';
import { jsonValidator } from '../validation/json.validator';
import { Model } from 'mongoose';

class GenericValidation {
    public validate(model: Model<any, {}>, exlude: string[] = []): any {
        return async(req: Request, res: Response, next: NextFunction) => {
            try {
                const JsonShema: any = jsonValidator.mongooseModelToJsonShema(model, exlude);
                await jsonValidator.JSValidate(JsonShema, req.body);
                next();
            } catch (e) {
                next(e);
            }
        };
    }
}

export const genericValidator = new GenericValidation();
