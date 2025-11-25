# Module Template

Copy this template when creating a new module. Replace `YourModule` with your actual module name.

## File: modules/YourModule/model.js

```javascript
const mongoose = require('mongoose');
const BaseModel = require('../base-model');

const YourModuleSchema = {
    // Define your schema fields here
    name: {
        type: String,
        required: true,
        index: true
    },
    // Add more fields
};

class YourModuleModel extends BaseModel {
    constructor() {
        super(YourModuleSchema, {
            strict: false,
            timestamps: true
        });
        this.model = this.initModel('YourModule');
    }
}

module.exports = new YourModuleModel().model;
```

## File: modules/YourModule/validator.js

```javascript
const Joi = require('joi');
const BaseValidator = require('../base-validator');

class YourModuleValidator extends BaseValidator {
    static createSchema = Joi.object({
        name: Joi.string().required(),
        // Add validation rules
    });

    static updateSchema = Joi.object({
        name: Joi.string().optional(),
        // Add validation rules
    });

    static listSchema = Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
    });

    static getSchema = Joi.object({
        id: Joi.string().required()
    });
}

module.exports = YourModuleValidator;
```

## File: modules/YourModule/service.js

```javascript
const BaseService = require('../base-service');
const YourModuleModel = require('./model');
const { NoRecordFoundError } = require('../../lib/errors');
const { MESSAGES } = require('../../utils/globals');

class YourModuleService extends BaseService {
    constructor() {
        super({ model: YourModuleModel });
    }

    async getById(id) {
        const item = await this.model.findById(id).lean();
        if (!item) {
            throw new NoRecordFoundError(MESSAGES.NO_RECORD_FOUND_ERROR);
        }
        return item;
    }
}

module.exports = YourModuleService;
```

## File: modules/YourModule/controller.js

```javascript
const BaseController = require('../base-controller');
const YourModuleService = require('./service');

class YourModuleController extends BaseController {
    constructor() {
        super();
        this.yourModuleService = new YourModuleService();
    }

    async create(req, res, next) {
        try {
            const result = await this.yourModuleService.create(req.body);
            return this.success(res, result, 'Created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async get(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this.yourModuleService.getById(id);
            return this.success(res, result);
        } catch (error) {
            next(error);
        }
    }

    async list(req, res, next) {
        try {
            const result = await this.yourModuleService.list(req.query);
            return this.success(res, result);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this.yourModuleService.update(id, req.body);
            return this.success(res, result, 'Updated successfully');
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.yourModuleService.delete({ _id: id });
            return this.success(res, null, 'Deleted successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = YourModuleController;
```

## File: modules/YourModule/router.js

```javascript
const router = require('express').Router();
const YourModuleController = require('./controller');
const { ValidatorMiddleware } = require('../../middlewares');
const YourModuleValidator = require('./validator');

const controller = new YourModuleController();

router.route('/')
    .get(ValidatorMiddleware.validate(YourModuleValidator.listSchema), controller.list.bind(controller))
    .post(ValidatorMiddleware.validate(YourModuleValidator.createSchema), controller.create.bind(controller));

router.route('/:id')
    .get(ValidatorMiddleware.validate(YourModuleValidator.getSchema), controller.get.bind(controller))
    .patch(ValidatorMiddleware.validate(YourModuleValidator.updateSchema), controller.update.bind(controller))
    .delete(ValidatorMiddleware.validate(YourModuleValidator.getSchema), controller.delete.bind(controller));

module.exports = router;
```

## Register in loaders/express.js

```javascript
const YourModuleRouter = require('../modules/YourModule/router');

// Add to routesConfig array:
{
    path: "/api/v1/your-module",
    router: YourModuleRouter,
    isPrivate: true,  // Requires JWT authentication
    isAdmin: false    // Requires admin role (set to true if admin-only)
}
```

