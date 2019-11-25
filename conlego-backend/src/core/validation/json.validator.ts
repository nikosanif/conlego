import { Model } from 'mongoose';
import Ajv from 'ajv';
import { mongooseValidator } from './mongoose.validator';
import { Request, Response, NextFunction } from 'express';
import { mongoose } from '@typegoose/typegoose';
import { UnprocessableEntity } from 'http-errors';
import { ModelDocumentType } from '@app/core/types';
import { logger } from '@app/core/utils/logger';
export class JsonValidator {
    private ajv: Ajv.Ajv;
    private readonly defaultOptions: Ajv.Options = {
        $data: true,
        async: true,
        allErrors: true, // options can be passed, e.g. {allErrors: true}
        removeAdditional: 'all', // With option removeAdditional you can filter data during the validation.
        jsonPointers: true
    };
    constructor(options: Ajv.Options = {}, customKeywords = true) {
        this.ajv = new Ajv({...this.defaultOptions, ...options});
        // tslint:disable-next-line: no-var-requires
        require('ajv-merge-patch')(this.ajv);
        // tslint:disable-next-line: no-var-requires
        require('ajv-keywords')(this.ajv);
        // tslint:disable-next-line: no-var-requires
        require('ajv-errors')(this.ajv, { singleError: true, keepErrors: false } );
        // tslint:disable-next-line: no-var-requires
        require('ajv-async')(this.ajv);
        if (customKeywords) {
            this.enableUniqueKeyword();
            this.enableExistsKeyword();
        }
    }

    /**
     *
     *
     * @param {Schema} shema
     * @returns {*}
     * @memberof MongooseValidator
     */
    public mongooseModelToJsonShema(
        model: Model<ModelDocumentType<any>, {}>, readonly: string[] = [], async = true
    ): any {
        const rules = [
            { path: /^([^.]?\.?)*_id$/ },
            { path: /^([^.]?\.?)*__v$/ },
            { path: /^([^.]?\.?)*createdAt$/ },
            { path: /^([^.]?\.?)*updatedAt$/ }
        ];
        for ( const exludePath of readonly) {
            rules.push({
                path: new RegExp(`${exludePath}`),
            });
        }
        const jsonSchema = (model as any).jsonSchema(null, null, rules);
        jsonSchema.$async = async;
        return jsonSchema;
    }

    /**
     *
     *
     * @memberof JsonValidator
     */
    public enableUniqueKeyword() {
        this.ajv.addKeyword('unique', {
            type: 'string',
            compile: (sch: boolean, parentSchema: any, it: any) => {
                return async (
                    data: string, currentpath: any, parentdataObj: any, propname: any, rootData: any
                    ) => new Promise( async (resolve, reject) => {
                        if ( !sch ) {
                            return resolve(true);
                        }
                        const modelName = it.root.schema.title;
                        const field = currentpath.replace(/^./, '');
                        const unique =  await mongooseValidator.isEntityUnique(it.root.schema.title, data, field);
                        if ( unique ) {
                            return resolve(true);
                        } else {
                            return reject(
                                new UnprocessableEntity(`${modelName} -> ${propname} (${data}) must be unique`)
                            );
                        }
                });
            },
            errors: false,
            async: true,
            modifying: false,
            metaSchema: { type: 'boolean', additionalItems: false }
        });
    }


    /**
     *
     *
     * @memberof JsonValidator
     */
    public enableExistsKeyword() {
        this.ajv.addKeyword('exists', {
            compile: (sch: boolean, parentSchema: any, it: any) => {
                return async (
                    data: string | string[], currentpath: any, parentdataObj: any, propname: any, rootData: any
                    ) => new Promise( async (resolve, reject) => {
                        if ( !sch ) {
                            return resolve(true);
                        }
                        const isArray = Array.isArray(data);
                        const ref = isArray ? parentSchema?.items['x-ref'] : parentSchema['x-ref'];
                        if (!ref ?? null) {
                            return resolve(true);
                        }
                        const exists = isArray ?
                        await mongooseValidator.areEntitiesExists(ref, data as string[] ) :
                        await mongooseValidator.isEntityExists(ref, data);
                        if ( exists ) {
                            return resolve(true);
                        } else {
                            const errorMsg = isArray ?
                            `All of ${it.root.schema.title} -> ${propname} references [${data}] must exist` :
                            `${it.root.schema.title} -> ${propname} reference (${data}) does not exist`;
                            return reject(new UnprocessableEntity(errorMsg));
                        }
                });
            },
            errors: false,
            async: true,
            modifying: true,
            metaSchema: { type: 'boolean', additionalItems: false }
        });
    }


    /**
     *
     *
     * @param {*} JsonShema
     * @param {*} body
     * @memberof JsonValidator
     */
    public async JSValidate(JsonShema: any, body: any) {
        try {
            await this.ajv.validate(JsonShema, body);
        } catch (e) {
            throw new UnprocessableEntity(e.errors ?? e.message);
        }
    }


    /**
     *
     *
     * @returns {*}
     * @memberof JsonValidator
     */
    public _ObjectId(): any {
        return async(req: Request, res: Response, next: NextFunction) => {
            try {
                const JsonShema = {
                    title: '',
                    $async: true,
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            pattern: '^[0-9a-fA-F]{24}$'
                        }
                    },
                    required: ['id'],
                    errorMessage: {
                        properties: {
                            id: `he id url parameter (${req.params.id}) must be a valid object id`
                        },
                        required: {
                            id: 'The id url parameter is required'
                        }
                    }
                };
                await this.JSValidate(JsonShema, { id: req.params.id });
                next();
            } catch (e) {
                next(new UnprocessableEntity(Array.isArray(e.message) ? e.message[0].message : e.message));
            }
        };
    }

    /**
     *
     *
     * @returns {*}
     * @memberof JsonValidator
     */
    public LoginValidator(): any {
        return async(req: Request, res: Response, next: NextFunction) => {
            try {
                const JsonShema = {
                    title: '',
                    $async: true,
                    type: 'object',
                    properties: {
                        client_id: {
                            type: 'string'
                        },
                        client_secret: {
                            type: 'string'
                        },
                        username: {
                            type: 'string'
                        },
                        password: {
                            type: 'string'
                        },
                        grant_type: {
                            type: 'string'
                        },
                    },
                    required: [ 'client_id', 'grant_type', 'username',  'password', 'client_secret' ],
                    additionalProperties: false,

                };
                await this.JSValidate(JsonShema, req.body);
                next();
            } catch (e) {
                next(e);
            }
        };
    }

}

export const jsonValidator = new JsonValidator();
export const jsonValidatorWithoutCustomKeywords = new JsonValidator({}, false);
