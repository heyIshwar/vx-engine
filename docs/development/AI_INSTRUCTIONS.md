# AI Assistant Instructions for VX Engine

This document provides specific instructions for AI assistants (like Cursor AI, GitHub Copilot, etc.) working on VX Engine.

## 🎯 Core Principles

1. **Always extend base classes** - Use BaseModel, BaseService, BaseController
2. **Follow the modular structure** - Each feature = one module
3. **Use soft delete by default** - Hard delete only for admin operations
4. **Validate everything** - Use Joi validators for all inputs
5. **Handle errors properly** - Use custom error classes from `lib/errors`
6. **Maintain consistency** - Follow existing code patterns

## 📁 Project Structure

```
vx-engine/
├── modules/          # Feature modules (User, Admin, File, etc.)
├── models/           # Standalone database models
├── middlewares/      # Express middlewares
├── loaders/          # Application loaders (express, mongoose, cron)
├── lib/              # Core libraries (config, errors, authentication)
├── utils/            # Utility functions
├── scripts/          # Utility scripts (seed, backup)
├── crons/            # Cron job definitions
└── .cursor/          # AI/Cursor documentation
```

## 🔧 Adding a New Module

### Quick Steps

1. **Create module directory**: `modules/YourModule/`
2. **Create files** (use `.cursor/MODULE_TEMPLATE.md`):
   - `model.js` - Database model (extends BaseModel)
   - `service.js` - Business logic (extends BaseService)
   - `controller.js` - HTTP handlers (extends BaseController)
   - `router.js` - Route definitions
   - `validator.js` - Joi validation schemas

3. **Register in `loaders/express.js`**:
   ```javascript
   const YourModuleRouter = require('../modules/YourModule/router');
   
   // Add to routesConfig:
   {
       path: "/api/v1/your-module",
       router: YourModuleRouter,
       isPrivate: true,  // Requires JWT auth
       isAdmin: false    // Requires admin role
   }
   ```

### Code Patterns

#### Model Pattern
```javascript
const BaseModel = require('../base-model');
class YourModel extends BaseModel {
    constructor() {
        super(schemaDefinition, options);
        this.model = this.initModel('YourModel');
    }
}
module.exports = new YourModel().model;
```

#### Service Pattern
```javascript
const BaseService = require('../base-service');
class YourService extends BaseService {
    constructor() {
        super({ model: YourModel });
    }
    // Custom methods here
}
```

#### Controller Pattern
```javascript
const BaseController = require('../base-controller');
class YourController extends BaseController {
    async method(req, res, next) {
        try {
            const result = await this.service.method();
            return this.success(res, result);
        } catch (error) {
            next(error);
        }
    }
}
```

## 🔐 Authentication & Authorization

- **Public routes**: No middleware needed
- **Authenticated routes**: Add `UserMiddleware.authenticate`
- **Admin routes**: Add `UserMiddleware.authenticate` + `AdminMiddleware.checkAdmin`

```javascript
// Public
router.get('/public', controller.method);

// Authenticated
router.get('/private', UserMiddleware.authenticate, controller.method);

// Admin only
router.get('/admin', UserMiddleware.authenticate, AdminMiddleware.checkAdmin, controller.method);
```

## 🗑️ Soft Delete Pattern

All models automatically support soft delete:

```javascript
// Soft delete (default)
await Model.deleteMany({ _id: id }); // Sets isDeleted: true

// Hard delete (admin only)
await Model.hardDeleteMany({ _id: id }); // Permanent deletion

// Restore
const item = await Model.findOne({ _id: id, isDeleted: true });
await item.restore();
```

## ✅ Validation Pattern

```javascript
// In validator.js
static createSchema = Joi.object({
    field: Joi.string().required(),
    optionalField: Joi.string().optional()
});

// In router.js
router.post('/', 
    ValidatorMiddleware.validate(YourValidator.createSchema),
    controller.create
);
```

## 🚨 Error Handling Pattern

```javascript
// Use custom error classes
const { 
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    ConflictError
} = require('../../lib/errors');

// Throw errors
throw new NotFoundError('Resource not found');

// In controllers
try {
    // code
} catch (error) {
    next(error); // Pass to error handler
}
```

## 📝 Response Format

Always use consistent response format:

```javascript
// Success
this.success(res, data, 'Message', 200);

// Error (handled automatically by error middleware)
{
    success: false,
    error: {
        name: "ERROR_TYPE",
        message: "Error message"
    },
    timestamp: "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Common Tasks

### Adding a New Route

1. Add route definition in `router.js`
2. Add controller method
3. Add service method (if needed)
4. Add validator schema
5. Test endpoint

### Adding a New Cron Job

1. Create file in `crons/your-cron.js`
2. Extend `BaseCron`
3. Register in `loaders/cron.js`

```javascript
// crons/your-cron.js
const BaseCron = require('./base-cron');
class YourCron extends BaseCron {
    constructor() {
        super('0 2 * * *', async () => {
            // Your logic
        });
    }
}

// In loaders/cron.js
this.register(new YourCron());
```

### Adding a New Middleware

1. Create file in `middlewares/your-middleware.js`
2. Export middleware function
3. Add to `middlewares/index.js`
4. Use in routes

### Adding Environment Variables

1. Add to `.env.example`
2. Access via `process.env.VAR_NAME` or `config.get('path:to:config')`

## 🧪 Testing Checklist

When adding/modifying code:
- [ ] Follows existing patterns
- [ ] Extends base classes
- [ ] Has proper error handling
- [ ] Has validation
- [ ] Uses soft delete (if deleting)
- [ ] Properly authenticated (if needed)
- [ ] Logs important operations
- [ ] Follows response format

## 📚 Reference Files

- **Module Template**: `.cursor/MODULE_TEMPLATE.md`
- **Development Guide**: `.cursor/DEVELOPMENT_GUIDE.md`
- **Cursor Rules**: `.cursorrules`
- **Base Classes**: `modules/base-*.js`
- **Error Classes**: `lib/errors/`

## ⚠️ Common Mistakes to Avoid

1. ❌ Don't create models without extending BaseModel
2. ❌ Don't hard delete by default (use soft delete)
3. ❌ Don't skip validation
4. ❌ Don't forget to register routes in express.js
5. ❌ Don't use console.log (use logger)
6. ❌ Don't expose sensitive data in responses
7. ❌ Don't forget error handling
8. ❌ Don't create routes without authentication checks

## 💡 Tips

- Always check existing modules (User, Admin, File) for patterns
- Use BaseService methods (create, get, list, update, delete) when possible
- Follow RESTful conventions for routes
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

## 🔍 Quick Lookups

- **Find base classes**: `modules/base-*.js`
- **Find error classes**: `lib/errors/index.js`
- **Find middleware**: `middlewares/`
- **Find utilities**: `utils/`
- **Find config**: `lib/config/`

