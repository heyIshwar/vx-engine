const mongoose = require('mongoose');
const Joi = require('joi');

const { objectIdValidator } = require('../lib/validators/validators.lib');

class BaseValidator {
    constructor(schemaDefinition, modelName) {
        this.schemaDefinition = schemaDefinition;
        this.modelName = modelName;
        this.validators = this.createValidators();
    }

    createValidators() {
        return {
            get: {
                query: Joi.object({
                    [`${this.modelName}Id`]: Joi.custom(objectIdValidator).required(),
                }),
            },
            list: {
                query: Joi.object({
                    limit: Joi.number().integer().min(1).default(10),
                    page: Joi.number().integer().min(1).default(1),
                    sortBy: Joi.string().valid(...Object.keys(this.schemaDefinition)).default('createdAt'),
                    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
                }),
            },
            create: {
                payload: Joi.object(this.generateJoiSchema(this.schemaDefinition)),
            },
            update: {
                params: Joi.object({
                    [`${this.modelName}Id`]: Joi.custom(objectIdValidator).required(),
                }),
                payload: Joi.object(this.generateJoiSchema(this.schemaDefinition, [], true)),
            },
            remove: {
                params: Joi.object({
                    [`${this.modelName}Id`]: Joi.custom(objectIdValidator).required(),
                }),
            },
        };
    }

    generateJoiSchema(fields, requiredFields = [], isUpdate = false) {
        const schema = {};

        for (const field in fields) {
            let fieldSchema = this.convertToJoi(fields[field]);

            if (requiredFields.includes(field) && !isUpdate) {
                schema[field] = fieldSchema.required();
            } else {
                schema[field] = fieldSchema.optional();
            }
        }

        return schema;
    }

    convertToJoi(field) {
        let joiSchema;

        switch (field.type) {
            case String:
                joiSchema = Joi.string();
                if (field.enum) {
                    joiSchema = joiSchema.valid(...field.enum);
                }
                if (field.match) {
                    joiSchema = joiSchema.pattern(field.match);
                }
                if (field.email) {
                    joiSchema = joiSchema.email();
                }
                if (field.uri) {
                    joiSchema = joiSchema.uri();
                }
                if (field.lowercase) {
                    joiSchema = joiSchema.lowercase();
                }
                if (field.uppercase) {
                    joiSchema = joiSchema.uppercase();
                }
                break;

            case Number:
                joiSchema = Joi.number();
                if (field.min !== undefined) {
                    joiSchema = joiSchema.min(field.min);
                }
                if (field.max !== undefined) {
                    joiSchema = joiSchema.max(field.max);
                }
                if (field.integer) {
                    joiSchema = joiSchema.integer();
                }
                break;

            case Boolean:
                joiSchema = Joi.boolean();
                break;

            case Date:
                joiSchema = Joi.date();
                if (field.min !== undefined) {
                    joiSchema = joiSchema.min(field.min);
                }
                if (field.max !== undefined) {
                    joiSchema = joiSchema.max(field.max);
                }
                break;

            case mongoose.Schema.Types.ObjectId:
                joiSchema = Joi.custom(objectIdValidator);
                break;

            case Array:
                joiSchema = Joi.array();
                if (field.items) {
                    joiSchema = joiSchema.items(this.convertToJoi(field.items));
                }
                if (field.unique) {
                    joiSchema = joiSchema.unique();
                }
                if (field.minItems !== undefined) {
                    joiSchema = joiSchema.min(field.minItems);
                }
                if (field.maxItems !== undefined) {
                    joiSchema = joiSchema.max(field.maxItems);
                }
                break;

            case Object:
                joiSchema = Joi.object(this.generateJoiSchema(field.fields));
                break;

            default:
                joiSchema = Joi.any();
        }

        return joiSchema;
    }

    getValidator(validatorName) {
        return this.validators[validatorName] || null;
    }

    addCustomValidator(validatorName, validator) {
        this.validators[validatorName] = validator;
    }

    exportDefaultRules() {
        return { ...this.validators };
    }
}

module.exports = BaseValidator;
