# VX Engine

A modern, production-ready Express.js boilerplate with authentication, user management, admin features, and industry-standard best practices.

**Author**: [Ishwar Sarade](https://github.com/heyIshwar) - [Website](https://ishwar.dev) | [Email](mailto:ishwar.sarade@gmail.com)

## 🚀 Features

- **Modular Architecture**: Clean, modular design with separated concerns
- **Authentication System**: 
  - Local login with email/password
  - JWT bearer token authentication
  - Google OAuth integration
- **User Management**: Complete user CRUD operations with profile management
- **Admin Panel**: Admin routes for user management and system statistics
- **Soft Delete**: Logical deletion with automatic filtering
- **File Management**: AWS S3 integration for file uploads and management
- **Database Integration**: MongoDB with Mongoose ODM (port 27021 for local dev)
- **Email Service**: Nodemailer integration with AWS SES support
- **Security**: 
  - Helmet.js for security headers
  - CORS configuration
  - Rate limiting (different limits for auth vs API routes)
  - Request ID tracking
- **Logging**: Winston structured logging with file and console outputs
- **Cron Jobs**: Scheduled task management (including automated backups)
- **Backup System**: Automated MongoDB backups to S3 (gzipped)
- **Docker Support**: Containerized development environment
- **API Versioning**: `/api/v1/` prefix for all routes
- **Code Quality**: ESLint and Prettier configured
- **Testing**: Test structure with seed data support

## 📋 Prerequisites

- Node.js 18+ (LTS recommended)
- Docker and Docker Compose
- npm or yarn package manager
- MongoDB (via Docker or local installation)

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/heyIshwar/vx-engine.git
   cd vx-engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional for quick start)
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
   
   **Note**: The development configuration (`lib/config/development_env_config.json`) is pre-configured with defaults that work with Docker Compose and seed script. You can start immediately without setting up `.env` file for local development.

4. **Set up the database**
   ```bash
   # Start MongoDB and Mongo Express using Docker Compose
   docker-compose up -d
   ```
   MongoDB will be available on `localhost:27021`

5. **Seed the database**
   ```bash
   npm run seed
   ```
   This creates an admin user and test users:
   - Admin: `admin@example.com` / `admin123`
   - Test users: See seed script output

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will start on `http://localhost:3008` (or the port specified in your configuration).

## 🔧 Configuration

VX Engine uses environment-based configuration files located in `lib/config/`:

- `base_config.json` - Base configuration
- `development_env_config.json` - Development environment settings
- `staging_env_config.json` - Staging environment settings
- `production_env_config.json` - Production environment settings

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Core
NODE_ENV=development
PORT=3008

# Database
MONGODB_URI=mongodb://vxengine:vxengine123@localhost:27021/vx_engine_development
MONGODB_USERNAME=vxengine
MONGODB_PASSWORD=vxengine123

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400

# AWS
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket
BACKUP_BUCKET=your-backup-bucket

# Email
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
EMAIL_FROM=noreply@example.com
```

## 📁 Project Structure

```
vx-engine/
├── lib/                    # Core libraries and utilities
│   ├── config/            # Configuration files
│   ├── authentication/    # Authentication strategies
│   ├── errors/           # Custom error classes
│   └── validators/       # Validation utilities
├── modules/               # Application modules
│   ├── Authentication/   # Authentication module
│   ├── User/            # User management
│   ├── Admin/           # Admin routes
│   └── File/            # File management
├── loaders/              # Application loaders
│   ├── express.js       # Express app configuration
│   ├── mongoose.js      # Database connection
│   └── cron.js          # Cron job loader
├── middlewares/          # Custom middlewares
│   ├── admin.js         # Admin authentication
│   ├── soft-delete.js   # Soft delete filtering
│   ├── rate-limiter.js  # Rate limiting
│   └── request-id.js    # Request ID tracking
├── models/              # Database models
├── routes/              # Route definitions
├── utils/               # Utility functions
│   └── logger.js        # Winston logger
├── scripts/             # Utility scripts
│   ├── seed.js         # Database seeding
│   └── backup.js       # MongoDB backup
├── crons/               # Cron job definitions
├── tests/               # Test files
├── postman/             # Postman collection
├── app.js               # Application entry point
└── AppLoader.js         # Application loader class
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login (local)
- `DELETE /api/v1/user/logout` - User logout

### User Management
- `GET /api/v1/user/` - Get user profile
- `PATCH /api/v1/user/` - Update user profile
- `GET /api/v1/user/session` - Get active sessions
- `DELETE /api/v1/user/session/:sessionId` - Delete session

### Admin Routes (Requires admin authentication)
- `GET /api/v1/admin/stats` - Get system statistics
- `GET /api/v1/admin/users` - Get all users (including soft-deleted)
- `GET /api/v1/admin/users/:userId` - Get user by ID
- `PATCH /api/v1/admin/users/:userId/activate` - Activate/deactivate user
- `PATCH /api/v1/admin/users/:userId/restore` - Restore soft-deleted user
- `DELETE /api/v1/admin/users/:userId/hard` - Hard delete user

### Health Checks
- `GET /health` - Health check endpoint
- `GET /ready` - Readiness check (includes DB status)

## 🐳 Docker Setup

The project includes Docker Compose configuration for easy development setup:

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

MongoDB runs on port **27021** (to avoid conflicts with default MongoDB port).

## 🧪 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run seed` - Seed database with initial data
- `npm run backup` - Run manual backup
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests (when configured)

### Authentication

#### Local Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response includes `accessToken` - use as `Authorization: Bearer <token>` header.

#### Google OAuth
Configure Google OAuth credentials in config files and use the OAuth endpoints.

## 🔐 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing
- **Input Validation**: Joi-based request validation
- **Rate Limiting**: Different limits for auth and API routes
- **Request ID Tracking**: Unique ID for each request

## 📧 Email Configuration

Configure email settings in your environment config or `.env`:

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com
```

## 💾 Backup System

Automated backups run daily at 2 AM via cron job. Manual backup:

```bash
npm run backup
```

Backups are:
- Gzipped for compression
- Uploaded to S3 (if configured)
- Stored locally in `backups/` directory
- Old backups automatically cleaned (keeps last 5)

## 📱 Postman Collection

Import `postman/VX-Engine.postman_collection.json` into Postman for easy API testing.

Set environment variables:
- `baseUrl`: `http://localhost:3008`
- `accessToken`: (auto-set after login)

## 🧪 Testing

Run database seed first:
```bash
npm run seed
```

Then run tests (when test framework is configured):
```bash
npm test
```

## 📝 Code Quality

- **ESLint**: Code linting (`.eslintrc.js`)
- **Prettier**: Code formatting (`.prettierrc`)
- **EditorConfig**: Consistent editor settings (`.editorconfig`)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Docker Documentation](https://docs.docker.com/)

## 🆘 Support

For issues and questions:
- Check the [documentation](docs/)
- Review [API documentation](docs/API.md)
- Open an issue on GitHub

---

Built with ❤️ by [Ishwar Sarade](https://github.com/heyIshwar)
