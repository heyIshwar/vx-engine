# Cursor AI Documentation

This directory contains comprehensive documentation for AI assistants working on VX Engine.

## 📚 Documentation Files

### 🚀 [QUICK_START.md](./QUICK_START.md)
**Start here!** Quick reference for common tasks and patterns.

### 📖 [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
Complete guide covering:
- Adding new modules
- Adding cron jobs
- Adding middlewares
- Adding models
- Code patterns and best practices

### 📝 [MODULE_TEMPLATE.md](./MODULE_TEMPLATE.md)
Copy-paste template for creating new modules. Includes all required files with examples.

### 🤖 [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md)
Detailed instructions for AI assistants:
- Core principles
- Code patterns
- Common tasks
- Mistakes to avoid
- Quick lookups

## 🎯 Quick Links

- **Adding a module?** → See [MODULE_TEMPLATE.md](./MODULE_TEMPLATE.md)
- **Need patterns?** → See [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- **Quick reference?** → See [QUICK_START.md](./QUICK_START.md)
- **AI assistant?** → See [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md)

## 📋 Project Structure

```
vx-engine/
├── modules/          # Feature modules
│   ├── User/        # User management
│   ├── Admin/       # Admin routes
│   └── File/        # File management
├── models/          # Standalone models
├── middlewares/     # Express middlewares
├── loaders/         # App loaders
├── lib/             # Core libraries
├── utils/           # Utilities
├── scripts/         # Scripts (seed, backup)
├── crons/           # Cron jobs
└── docs/development/  # Development documentation (this directory)
```

## 🔑 Key Principles

1. **Extend base classes** - BaseModel, BaseService, BaseController
2. **Follow modular structure** - One feature = one module
3. **Use soft delete** - Hard delete only for admin
4. **Validate everything** - Use Joi validators
5. **Handle errors** - Use custom error classes
6. **Maintain consistency** - Follow existing patterns

## 💡 Tips

- Always check existing modules (User, Admin, File) for patterns
- Use the templates provided
- Follow RESTful conventions
- Keep code simple and focused
- Document complex logic

---

**Last Updated**: 2025-11-25
**Version**: 1.0.55

