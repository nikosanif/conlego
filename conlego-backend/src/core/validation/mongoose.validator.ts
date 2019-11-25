
import * as _ from 'lodash';
import mongoose from 'mongoose';
import { logger } from '@app/core/utils/logger';
import { Ref } from '@typegoose/typegoose';

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
    public async isEntityExists(modelName: string, value: Ref<any>, field = '_id'): Promise<boolean> {
        if ( !(value ?? null) ) {
            return true;
        }
        const filter: any = {};
        filter[field] = value;
        const exists = !!await mongoose.model(modelName).findOne(filter);
        if ( exists ) {
            return true;
        } else {
            return false;
        }
    }

    public async areEntitiesExists(modelName: string, value: Array<Ref<any>>, field = '_id'): Promise<boolean> {
        if ( (value ?? []).length === 0 ) {
            return true;
        }
        const filter: any = {};
        filter[field] = {$in: value};
        const multipleFind = await mongoose.model(modelName).find(filter);
        const exists = multipleFind.length === value.length ? true : false;
        if ( exists ) {
            return true;
        } else {
            return false;
        }
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
    public async isEntityUnique(modelName: string, value: string, field: string): Promise <boolean> {
        if ( !(value ?? null) ) {
            return true;
        }
        const filter: any = {};
        filter[field] = value;
        const exists = !!await mongoose.model(modelName).findOne(filter);
        if ( exists ) {
            return false;
        } else {
            return true;
        }
    }
}

export let mongooseValidator = new MongooseValidator();
