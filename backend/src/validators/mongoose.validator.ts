
import * as _ from 'lodash';
import mongoose from 'mongoose';
import { NextFunction } from 'express';
import { UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { getErrorBody } from '@app/core/middlewares';

class MongooseValidator {
    /**
     *
     *
     * @param {string} model
     * @param {string} value
     * @param {string} [field='_id']
     * @returns {Promise<boolean>}
     * @memberof FieldValidator
     */
    public async isEntityExists(model: string, value: string, field = '_id'): Promise<boolean> {
        const filter: any = {};
        filter[field] = value;
        return !!await mongoose.model(model).findOne(filter);
    }

    /**
     *
     *
     * @param {string} model
     * @param {string} value
     * @param {string} [field='_id']
     * @returns {Promise <boolean>}
     * @memberof FieldValidator
     */
    public async isEntityUnique(model: string, value: string, field = '_id'): Promise <boolean> {
        return !await this.isEntityExists(model, value, field);
    }


    /**
     *
     *
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @param {*} JsonShema
     * @returns
     * @memberof MongooseValidator
     */
    public async checkSchemaExists(JsonSchema: any, body: any, next: NextFunction ) {
        const modelName: any = JsonSchema.title;
        const properties: any = JsonSchema.properties;
        for (const key of Object.keys(JsonSchema.properties)) {
            const xRefValue = properties[key]['x-ref'];
            const ReqValue = body[key];
            if (!!xRefValue && !!ReqValue) {
                const exists = await this.isEntityExists(xRefValue, ReqValue);
                if (!exists) {
                    const error: any = getErrorBody(UNPROCESSABLE_ENTITY, `${xRefValue} reference ${ReqValue} does not exist`);
                    return next(error);
                }
            }
        }
    }

    /**
     *
     *
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @param {*} JsonShema
     * @param {*} [uniqueFields=[]]
     * @returns
     * @memberof MongooseValidator
     */
    public async checkUnique(JsonSchema: any, body: any, uniqueFields: string[], next: NextFunction) {
        const modelName: any = JsonSchema.title;
        for (const uniqueField of uniqueFields) {
                const isUnique = await this.isEntityUnique(modelName, body[uniqueField], uniqueField);
                if (!isUnique) {
                    const error: any = getErrorBody(UNPROCESSABLE_ENTITY, `${uniqueField} must be unique`);
                    return next(error);
                }
        }
    }
}

export let mongooseValidator = new MongooseValidator();
