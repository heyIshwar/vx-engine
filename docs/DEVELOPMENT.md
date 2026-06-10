# VX Engine Development Guide

This guide covers the development setup, architecture, and best practices for working with VX Engine.

## Quick Start

1. **Clone and Setup**
   ```bash
   git clone https://github.com/heyIshwar/vx-engine.git
   cd vx-engine
   npm install
   ```

2. **Start Development Environment**
   ```bash
   # Start MongoDB and services
   docker-compose up -d
   
   # Start the application
   npm run dev
   ```

3. **Access Services**
   - Application: http://localhost:3008
   - MongoDB UI: http://localhost:8081
   - MongoDB: localhost:27021

## Architecture Overview

VX Engine follows a modular architecture with clear separation of concerns:

### Core Components

- **AppLoader**: Main application bootstrap and loader management
- **Loaders**: Service initialization (Express, MongoDB, Cron)
- **Modules**: Business logic organized by feature
- **Middlewares**: Request processing and authentication
- **Configuration**: Environment-based config management

### Module Structure

Each module follows this structure:
```
modules/[ModuleName]/
├── controller.js     # HTTP request handlers
├── service.js        # Business logic
├── model.js          # Database models
├── validator.js      # Input validation
└── router.js         # Route definitions
```

## Database Setup

### Local Development

The project uses Docker Compose for local MongoDB:

```yaml
# docker-compose.yml
services:
  mongodb:
    image: mongo:latest
    container_name: vx-engine-mongodb
    ports:
      - "27021:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: vxengine
      MONGO_INITDB_ROOT_PASSWORD: vxengine123
```

### Connection Configuration

Database connections are handled by the `MongooseLoader`:

```javascript
// loaders/mongoose.js
class MongooseLoader {
  async connect() {
    // Automatically detects local vs Atlas connections
    // Builds appropriate connection string
  }
}
```

### Environment Configs

- **Development**: `lib/config/development_env_config.json`
- **Staging**: `lib/config/staging_env_config.json`
- **Production**: `lib/config/production_env_config.json`

## Authentication System

VX Engine uses JWT-based authentication with Passport.js strategies:

### Available Strategies
- Local authentication (username/password)
- JWT token validation
- Google OAuth (configurable)

### Implementation
```javascript
// modules/Authentication/
├── controller.js     # Login, register, logout
├── service.js        # User verification, token generation
└── strategies/       # Passport strategies
```

## File Management

AWS S3 integration for file uploads:

```javascript
// Configuration
{
  "file": {
    "s3": {
      "bucket": "your-bucket",
      "accessKeyId": "your-access-key",
      "secretAccessKey": "your-secret-key",
      "region": "ap-south-1"
    },
    "maxFileSize": 100000000,
    "maxFileCount": 10
  }
}
```

## API Development

### Creating New Endpoints

1. **Create Module Structure**
   ```bash
   mkdir modules/YourModule
   touch modules/YourModule/{controller,service,model,validator,router}.js
   ```

2. **Define Model** (if needed)
   ```javascript
   // modules/YourModule/model.js
   const BaseModel = require('../base-model');
   
   class YourModel extends BaseModel {
     constructor() {
       super('YourCollection');
     }
   }
   ```

3. **Create Service**
   ```javascript
   // modules/YourModule/service.js
   const BaseService = require('../base-service');
   
   class YourService extends BaseService {
     constructor() {
       super();
     }
   }
   ```

4. **Add Controller**
   ```javascript
   // modules/YourModule/controller.js
   const BaseController = require('../base-controller');
   
   class YourController extends BaseController {
     constructor() {
       super();
     }
   }
   ```

5. **Define Routes**
   ```javascript
   // modules/YourModule/router.js
   const express = require('express');
   const router = express.Router();
   
   router.get('/', controller.getAll);
   router.post('/', controller.create);
   
   module.exports = router;
   ```

6. **Register in Express Loader**
   ```javascript
   // loaders/express.js
   const YourRouter = require('../modules/YourModule/router');
   
   this.routesConfig = [
     { path: "/your-module", router: YourRouter, isPrivate: true }
   ];
   ```

## Middleware Development

### Custom Middleware

Create middleware in `middlewares/` directory:

```javascript
// middlewares/your-middleware.js
module.exports = (req, res, next) => {
  // Your middleware logic
  next();
};
```

### Built-in Middlewares

- **IPAddressMiddleware**: IP address logging
- **HeadersMiddleware**: Custom headers
- **UserMiddleware**: Authentication
- **ValidatorMiddleware**: Request validation

## Validation

Using Joi for request validation:

```javascript
// modules/YourModule/validator.js
const BaseValidator = require('../base-validator');
const Joi = require('joi');

class YourValidator extends BaseValidator {
  static createSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required()
  });
}
```

## Error Handling

Custom error classes in `lib/errors/`:

```javascript
// Usage
const { BadRequestParameterError } = require('../lib/errors');

if (!user) {
  throw new BadRequestParameterError('User not found');
}
```

## Cron Jobs

Add scheduled tasks in `crons/` directory:

```javascript
// crons/your-cron.js
const cron = require('node-cron');

module.exports = {
  schedule: '0 0 * * *', // Daily at midnight
  task: () => {
    console.log('Running daily task');
  }
};
```

## Testing

### Setup Test Environment

```bash
# Install test dependencies (when available)
npm install --save-dev jest supertest

# Run tests
npm test
```

### Writing Tests

```javascript
// tests/modules/YourModule.test.js
const request = require('supertest');
const app = require('../../app');

describe('YourModule', () => {
  test('should create item', async () => {
    const response = await request(app)
      .post('/your-module')
      .send({ name: 'Test' });
    
    expect(response.status).toBe(201);
  });
});
```

## Environment Management

### Development
```bash
NODE_ENV=development npm run dev
```

### Staging
```bash
NODE_ENV=staging npm start
```

### Production
```bash
NODE_ENV=production npm run production
```

## Docker Development

### Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart mongodb

# Stop all services
docker-compose down
```

### MongoDB Management

- **Direct Connection**: `mongodb://vxengine:vxengine123@localhost:27021/vx_engine_development`
- **Mongo Express**: http://localhost:8081
- **Credentials**: admin/admin123

## Code Style and Standards

### File Naming
- Classes: PascalCase (`UserController.js`)
- Files: kebab-case (`user-helper.js`)
- Directories: PascalCase for modules, lowercase for others

### Code Organization
- One class per file
- Use base classes for common functionality
- Keep modules independent
- Follow separation of concerns

### Best Practices
- Use async/await over callbacks
- Implement proper error handling
- Add JSDoc comments for complex functions
- Keep configuration external
- Use environment variables for secrets

## Debugging

### Application Debugging
```bash
# Development with warnings
npm run dev

# Debug mode
DEBUG=* npm run dev

# Specific debug namespace
DEBUG=app:* npm run dev
```

### Database Debugging
```bash
# MongoDB logs
docker-compose logs -f mongodb

# Connect to MongoDB directly
docker exec -it vx-engine-mongodb mongosh
```

## Performance Monitoring

### Built-in Logging
- Morgan HTTP request logging
- Custom error logging
- Database connection monitoring

### Adding Custom Metrics
```javascript
// Example: Request timing
const startTime = Date.now();
// ... process request
const duration = Date.now() - startTime;
console.log(`Request processed in ${duration}ms`);
```

## Deployment

### Production Checklist
- [ ] Update production config
- [ ] Set environment variables
- [ ] Configure external MongoDB
- [ ] Set up AWS S3 credentials
- [ ] Configure email service
- [ ] Set up monitoring
- [ ] Enable SSL/HTTPS
- [ ] Configure reverse proxy

### Environment Variables
```bash
# Production essentials
NODE_ENV=production
PORT=3008
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check Docker container status
   - Verify credentials in config
   - Ensure port is not blocked

2. **Authentication Errors**
   - Check JWT secret configuration
   - Verify token expiration settings
   - Ensure middleware order is correct

3. **File Upload Issues**
   - Check S3 credentials and permissions
   - Verify bucket configuration
   - Check file size limits

### Debug Commands
```bash
# Check running processes
docker-compose ps

# View application logs
docker-compose logs app

# Check MongoDB status
docker exec vx-engine-mongodb mongosh --eval "db.adminCommand('ping')"
```

## Contributing

1. Create feature branch from `main`
2. Follow coding standards
3. Add tests for new features
4. Update documentation
5. Submit pull request

## Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [JWT.io](https://jwt.io/)
- [Joi Validation](https://joi.dev/)
- [Docker Compose](https://docs.docker.com/compose/) 