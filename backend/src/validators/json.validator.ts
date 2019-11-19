import { Schema } from 'mongoose';
import Ajv from 'ajv';
import { UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { getErrorBody } from '@app/core/middlewares';
import { NextFunction } from 'express';
import { mongooseValidator } from './mongoose.validator';
class JsonValidator {

    /**
     *
     *
     * @param {Schema} shema
     * @returns {*}
     * @memberof MongooseValidator
     */
    public mongooseShemaToJsonShema(shema: Schema, collectionName: string): any {
        return (shema as any).jsonSchema(collectionName);
    }

    /**
     *
     *
     * @param {*} jsonShema
     * @param {Ajv.Options} [options={
     *         async: true,
     *         allErrors: true, // options can be passed, e.g. {allErrors: true}
     *         removeAdditional: 'all', // With option removeAdditional you can filter data during the validation.
     *     }]
     * @returns {Ajv.ValidateFunction}
     * @memberof JsonValidator
     */
    public JSCompile(jsonShema: any, options: Ajv.Options = {
        $data: true,
        async: true,
        allErrors: true, // options can be passed, e.g. {allErrors: true}
        removeAdditional: 'all', // With option removeAdditional you can filter data during the validation.
    }): Ajv.ValidateFunction {
        const ajv = new Ajv(options);
        // tslint:disable-next-line: no-var-requires
        require('ajv-merge-patch')(ajv);
        // tslint:disable-next-line: no-var-requires
        require('ajv-keywords')(ajv);
        return ajv.compile(jsonShema);
    }

    /**
     *
     *
     * @param {Ajv.ValidateFunction} shema
     * @param {*} json
     * @returns {(boolean | PromiseLike<any>)}
     * @memberof JsonValidator
     */
    public isJSValid(shema: Ajv.ValidateFunction, json: any): boolean | PromiseLike<any> {
        return shema(json);
    }

    /**
     *
     *
     * @param {*} shema
     * @param {string} field
     * @returns {*}
     * @memberof JsonValidator
     */
    public JSAddRequired(shema: any, field: string): any {
        return shema.required.push(field);
    }

}

export const jsonValidator = new JsonValidator();
