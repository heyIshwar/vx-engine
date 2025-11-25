# VX Engine Development Guide

This guide helps AI assistants and developers understand how to add new modules, features, and make changes to VX Engine.

## Table of Contents
1. [Adding a New Module](#adding-a-new-module)
2. [Adding a New Cron Job](#adding-a-new-cron-job)
3. [Adding a New Middleware](#adding-a-new-middleware)
4. [Adding a New Model](#adding-a-new-model)
5. [Code Patterns](#code-patterns)
6. [Common Tasks](#common-tasks)

---

## Adding a New Module

A module in VX Engine follows a consistent structure. Here's how to create one:

### Module Structure

```
modules/YourModule/
├── controller.js    # HTTP request/response handling
├── service.js       # Business logic
├── router.js        # Route definitions
├── validator.js     # Request validation schemas
└── model.js         # Database model (if needed)
```

### Step-by-Step Guide

#### 1. Create the Model (if needed)

```javascript
// modules/YourModule/model.js
const mongoose = require('mongoose');
const BaseModel = require('../base-model');

const YourModuleSchema = {
    name: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String
    },
    // Add your fields here
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

#### 2. Create the Validator

```javascript
// modules/YourModule/validator.js
const Joi = require('joi');
const BaseValidator = require('../base-validator');

class YourModuleValidator extends BaseValidator {
    static createSchema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional()
    });

    static updateSchema = Joi.object({
        name: Joi.string().optional(),
        description: Joi.string().optional()
    });

    static listSchema = Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        search: Joi.string().optional()
    });

    static getSchema = Joi.object({
        id: Joi.string().required()
    });
}

module.exports = YourModuleValidator;
```

#### 3. Create the Service

```javascript
// modules/YourModule/service.js
const BaseService = require('../base-service');
const YourModuleModel = require('./model');
const { NoRecordFoundError, BadRequestParameterError } = require('../../lib/errors');
const { MESSAGES } = require('../../utils/globals');

class YourModuleService extends BaseService {
    constructor() {
        super({ model: YourModuleModel });
    }

    async create(data) {
        // Add custom business logic here
        return await this.model.create(data);
    }

    async getById(id) {
        const item = await this.model.findById(id).lean();
        if (!item) {
            throw new NoRecordFoundError(MESSAGES.NO_RECORD_FOUND_ERROR);
        }
        return item;
    }

    // Add more custom methods as needed
}

module.exports = YourModuleService;
```

#### 4. Create the Controller

```javascript
// modules/YourModule/controller.js
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

#### 5. Create the Router

```javascript
// modules/YourModule/router.js
const router = require('express').Router();
const YourModuleController = require('./controller');
const { ValidatorMiddleware } = require('../../middlewares');
const YourModuleValidator = require('./validator');

const controller = new YourModuleController();

// Public routes
router.route('/')
    .get(ValidatorMiddleware.validate(YourModuleValidator.listSchema), controller.list.bind(controller))
    .post(ValidatorMiddleware.validate(YourModuleValidator.createSchema), controller.create.bind(controller));

router.route('/:id')
    .get(ValidatorMiddleware.validate(YourModuleValidator.getSchema), controller.get.bind(controller))
    .patch(ValidatorMiddleware.validate(YourModuleValidator.updateSchema), controller.update.bind(controller))
    .delete(ValidatorMiddleware.validate(YourModuleValidator.getSchema), controller.delete.bind(controller));

module.exports = router;
```

#### 6. Register the Router

Add to `loaders/express.js`:

```javascript
const YourModuleRouter = require('../modules/YourModule/router');

// In routesConfig array:
{
    path: "/api/v1/your-module",
    router: YourModuleRouter,
    isPrivate: true,  // Requires authentication
    isAdmin: false    // Requires admin role (if true)
}
```

---

## Adding a New Cron Job

### Step-by-Step Guide

#### 1. Create the Cron File

```javascript
// crons/your-cron.js
const BaseCron = require('./base-cron');

class YourCron extends BaseCron {
    constructor() {
        // Cron schedule: 'minute hour day month dayOfWeek'
        // Examples:
        // '0 2 * * *' - Daily at 2 AM
        // '*/5 * * * *' - Every 5 minutes
        // '0 0 * * 0' - Weekly on Sunday at midnight
        super('0 2 * * *', async () => {
            console.log('Running YourCron...');
            // Add your cron logic here
            try {
                // Your logic
            } catch (error) {
                console.error('Cron error:', error);
            }
        });
    }
}

module.exports = YourCron;
```

#### 2. Register the Cron

Add to `loaders/cron.js`:

```javascript
const YourCron = require('../crons/your-cron');

// In loadCrons() method:
this.register(new YourCron());
```

---

## Adding a New Middleware

### Step-by-Step Guide

#### 1. Create the Middleware File

```javascript
// middlewares/your-middleware.js
const { BadRequestError } = require('../lib/errors');

const yourMiddleware = (req, res, next) => {
    // Your middleware logic
    if (someCondition) {
        return next(new BadRequestError('Error message'));
    }
    next();
};

module.exports = yourMiddleware;
```

#### 2. Register the Middleware

Add to `middlewares/index.js`:

```javascript
const YourMiddleware = require('./your-middleware');

module.exports = {
    // ... existing exports
    YourMiddleware
};
```

#### 3. Use in Routes

```javascript
// In router.js or express.js
const { YourMiddleware } = require('../../middlewares');

router.get('/route', YourMiddleware, controller.method);
```

---

## Adding a New Model

### Step-by-Step Guide

#### 1. Create the Model File

```javascript
// models/YourModel.js
const mongoose = require('mongoose');

const YourModelSchema = new mongoose.Schema({
    field1: {
        type: String,
        required: true,
        index: true
    },
    field2: {
        type: Number,
        default: 0
    }
}, {
    strict: false,
    timestamps: true
});

// Create and export the model
const YourModel = mongoose.models.YourModel || mongoose.model('YourModel', YourModelSchema);

module.exports = YourModel;
```

#### 2. Use in Service

```javascript
const YourModel = require('../../models/YourModel');

// Use in service methods
const item = await YourModel.findOne({ field1: 'value' });
```

---

## Code Patterns

### Error Handling Pattern

```javascript
try {
    // Your code
    return this.success(res, data, 'Success message');
} catch (error) {
    next(error); // Pass to error handler
}
```

### Custom Error Types

```javascript
const { 
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError
} = require('../../lib/errors');

// Usage
throw new NotFoundError('Resource not found');
```

### Response Format

```javascript
// Success response
{
    success: true,
    data: {},
    message: "Operation successful",
    timestamp: "2024-01-01T00:00:00.000Z"
}

// Error response
{
    success: false,
    error: {
        name: "ERROR_TYPE",
        message: "Error description"
    },
    timestamp: "2024-01-01T00:00:00.000Z"
}
```

### Soft Delete Pattern

All models automatically support soft delete via BaseModel:

```javascript
// Soft delete (sets isDeleted: true)
await Model.deleteMany({ _id: id });

// Hard delete (permanent)
await Model.hardDeleteMany({ _id: id });

// Restore soft-deleted
const item = await Model.findOne({ _id: id, isDeleted: true });
await item.restore();
```

### Authentication Pattern

```javascript
// Public route
router.get('/public', controller.method);

// Authenticated route
router.get('/private', UserMiddleware.authenticate, controller.method);

// Admin route
router.get('/admin', UserMiddleware.authenticate, AdminMiddleware.checkAdmin, controller.method);
```

---

## Common Tasks

### Adding a New API Endpoint

1. Add route to `router.js`
2. Add controller method
3. Add service method (if needed)
4. Add validator schema (if needed)
5. Test the endpoint

### Adding Environment Variables

1. Add to `.env.example`
2. Add to config files if needed (`lib/config/*.json`)
3. Access via `process.env.VARIABLE_NAME` or `config.get('path:to:config')`

### Adding a New Dependency

1. Install: `npm install package-name`
2. Update `package.json` (automatic)
3. Use in code
4. Document if needed

### Database Migration

1. Create migration script in `scripts/`
2. Update models if schema changes
3. Test migration
4. Document changes

### Adding Logging

```javascript
const logger = require('../utils/logger');

logger.info('Info message', { context: 'data' });
logger.error('Error message', { error: errorObject });
logger.warn('Warning message');
logger.debug('Debug message');
```

---

## File Locations Reference

- **Models**: `models/` or `modules/ModuleName/model.js`
- **Services**: `modules/ModuleName/service.js`
- **Controllers**: `modules/ModuleName/controller.js`
- **Routers**: `modules/ModuleName/router.js`
- **Validators**: `modules/ModuleName/validator.js`
- **Middlewares**: `middlewares/`
- **Cron Jobs**: `crons/`
- **Scripts**: `scripts/`
- **Config**: `lib/config/`
- **Errors**: `lib/errors/`
- **Utils**: `utils/`

---

## Quick Checklist for New Module

- [ ] Create model (if needed)
- [ ] Create validator with schemas
- [ ] Create service extending BaseService
- [ ] Create controller extending BaseController
- [ ] Create router with routes
- [ ] Register router in `loaders/express.js`
- [ ] Add validation middleware
- [ ] Test endpoints
- [ ] Add error handling
- [ ] Update API documentation

---

## Notes

- Always extend base classes (BaseModel, BaseService, BaseController)
- Use soft delete by default (hard delete only for admin)
- Follow the response format pattern
- Use custom error classes
- Add validation for all inputs
- Use async/await, not callbacks
- Log important operations
- Follow the existing code style

