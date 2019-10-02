import { Model, Document } from 'mongoose';

/**
 * Generic unique validator
 *
 * @param {Model<Document>} model
 * @param {string} path
 * @param {object} [conditions={}]
 * @returns
 */
export function unique(model: Model<Document>, path: string, conditions: object = {}) {
  return async (value: any) => {
    const resource = await model
      .findOne({ [path]: value })
      .where(conditions);

    if (resource) {
      return Promise.reject({ code: 'unique', message: 'The :attribute \':value\' has already been taken' });
    }
  };
}
