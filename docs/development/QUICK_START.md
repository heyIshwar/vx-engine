# Quick Start Guide for AI Assistants

## 🚀 Adding a New Module (5 Steps)

1. **Create module files** using `.cursor/MODULE_TEMPLATE.md`
2. **Register router** in `loaders/express.js`:
   ```javascript
   const YourModuleRouter = require('../modules/YourModule/router');
   // Add to routesConfig array
   ```
3. **Test the endpoint**
4. **Done!**

## 📋 Module Checklist

- [ ] Created `model.js` (extends BaseModel)
- [ ] Created `service.js` (extends BaseService)
- [ ] Created `controller.js` (extends BaseController)
- [ ] Created `router.js` (with routes)
- [ ] Created `validator.js` (Joi schemas)
- [ ] Registered in `loaders/express.js`
- [ ] Added authentication if needed (`isPrivate: true`)
- [ ] Added admin check if needed (`isAdmin: true`)

## 🔑 Key Patterns

### Authentication
```javascript
// Public route
router.get('/public', controller.method);

// Authenticated route
router.get('/private', UserMiddleware.authenticate, controller.method);

// Admin route
router.get('/admin', UserMiddleware.authenticate, AdminMiddleware.checkAdmin, controller.method);
```

### Soft Delete
```javascript
// Soft delete (default)
await Model.deleteMany({ _id: id });

// Hard delete (admin only)
await Model.hardDeleteMany({ _id: id });
```

### Error Handling
```javascript
try {
    const result = await this.service.method();
    return this.success(res, result);
} catch (error) {
    next(error);
}
```

## 📚 Documentation Files

- **Full Guide**: `.cursor/DEVELOPMENT_GUIDE.md`
- **Module Template**: `.cursor/MODULE_TEMPLATE.md`
- **AI Instructions**: `.cursor/AI_INSTRUCTIONS.md`
- **Cursor Rules**: `.cursorrules`

## ⚡ Common Commands

```bash
# Start development server
npm run dev

# Seed database
npm run seed

# Run backup
npm run backup

# Lint code
npm run lint

# Format code
npm run format
```

