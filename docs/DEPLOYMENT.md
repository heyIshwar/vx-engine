# VX Engine Deployment Guide

This guide covers deploying VX Engine to various environments including development, staging, and production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Production Checklist](#production-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js 16+ (LTS recommended)
- Docker & Docker Compose
- Git
- MongoDB 5.0+ (or MongoDB Atlas)

### Required Services
- **Database**: MongoDB (local/Atlas)
- **File Storage**: AWS S3 (or compatible)
- **Email Service**: AWS SES or SMTP server
- **Push Notifications**: Firebase Cloud Messaging (optional)
- **Payment Gateway**: Razorpay (optional)

## Environment Configuration

### Environment Files

Create environment-specific configuration files:

```bash
# Development (already configured)
lib/config/development_env_config.json

# Staging
lib/config/staging_env_config.json

# Production
lib/config/production_env_config.json
```

### Environment Variables

Set these environment variables for production:

```bash
# Core Settings
NODE_ENV=production
PORT=3008

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_USERNAME=your-username
MONGODB_PASSWORD=your-password
MONGODB_DATABASE=vx_engine_production

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=86400
AUTH_SALT=your-auth-salt

# AWS Services
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=your-s3-bucket

# Email Service
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com

# Firebase (Optional)
FCM_SERVER_KEY=your-fcm-server-key

# Razorpay (Optional)
RAZORPAY_KEY=your-razorpay-key
RAZORPAY_SECRET=your-razorpay-secret

# Security
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Docker Deployment

### Production Docker Setup

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: vx-engine-app
    restart: unless-stopped
    ports:
      - "3008:3008"
    environment:
      - NODE_ENV=production
      - PORT=3008
    env_file:
      - .env.production
    depends_on:
      - mongodb
    networks:
      - vx-engine-network

  mongodb:
    image: mongo:5.0
    container_name: vx-engine-mongodb-prod
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGODB_DATABASE}
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - vx-engine-network

  nginx:
    image: nginx:alpine
    container_name: vx-engine-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - vx-engine-network

volumes:
  mongodb_data:
  mongodb_config:

networks:
  vx-engine-network:
    driver: bridge
```

### Production Dockerfile

Create `Dockerfile.prod`:

```dockerfile
FROM node:18-alpine

# Install PM2 globally
RUN npm install -g pm2

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3008/health || exit 1

# Start application with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

### PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'vx-engine',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3008
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3008;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

## Cloud Deployment

### AWS Deployment

#### Using AWS ECS

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name vx-engine
```

2. **Build and Push Docker Image**
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -f Dockerfile.prod -t vx-engine .

# Tag image
docker tag vx-engine:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/vx-engine:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/vx-engine:latest
```

3. **Create ECS Task Definition**
```json
{
  "family": "vx-engine",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "vx-engine",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/vx-engine:latest",
      "portMappings": [
        {
          "containerPort": 3008,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/vx-engine",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Using AWS Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize Application**
```bash
eb init vx-engine
```

3. **Create Environment**
```bash
eb create production
```

4. **Deploy**
```bash
eb deploy
```

### Digital Ocean Deployment

#### Using App Platform

1. **Create `app.yaml`**
```yaml
name: vx-engine
services:
- name: api
  source_dir: /
  github:
    repo: heyIshwar/vx-engine
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "8080"
databases:
- name: mongodb
  engine: MONGODB
  version: "5"
  size: db-s-1vcpu-1gb
```

### Heroku Deployment

1. **Create Heroku App**
```bash
heroku create vx-engine-app
```

2. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
# ... set other variables
```

3. **Create Procfile**
```
web: npm start
```

4. **Deploy**
```bash
git push heroku main
```

## Production Checklist

### Security
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up proper CORS origins
- [ ] Configure security headers (Helmet.js)
- [ ] Enable rate limiting
- [ ] Use secrets management (AWS Secrets Manager, etc.)
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] Network security groups/firewalls

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Caching strategy implemented
- [ ] Load balancing (if needed)

### Monitoring
- [ ] Application logs configured
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring (New Relic, etc.)
- [ ] Uptime monitoring
- [ ] Database monitoring
- [ ] Alert systems set up

### Backup & Recovery
- [ ] Database backup strategy
- [ ] File storage backup
- [ ] Disaster recovery plan
- [ ] Regular backup testing

## Monitoring & Maintenance

### Health Check Endpoint

Add health check endpoint:

```javascript
// Add to Express loader
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### Logging

Configure production logging:

```javascript
// Add to your logger configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Monitoring Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart application
pm2 restart vx-engine

# Reload application (zero downtime)
pm2 reload vx-engine
```

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker-compose logs app

# Check configuration
node -e "console.log(require('./lib/config'))"

# Verify environment variables
env | grep NODE_ENV
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb://username:password@host:port/database"

# Check network connectivity
telnet mongodb-host 27017

# Verify credentials
echo $MONGODB_URI
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Increase memory limit in PM2
pm2 restart vx-engine --max-memory-restart 2G
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in cert.pem -text -noout

# Test SSL connection
openssl s_client -connect yourdomain.com:443
```

### Performance Troubleshooting

```bash
# Profile Node.js application
node --prof app.js

# Generate profile report
node --prof-process isolate-*-v8.log > profile.txt

# Monitor database queries
# Enable MongoDB profiler
db.setProfilingLevel(1, { slowms: 100 })
```

### Log Analysis

```bash
# Analyze access logs
tail -f /var/log/nginx/access.log | grep "POST"

# Monitor error logs
tail -f logs/error.log

# Search for specific errors
grep -r "Error" logs/ --include="*.log"
```

## Deployment Scripts

Create deployment automation scripts:

### `deploy.sh`
```bash
#!/bin/bash

# Production deployment script
set -e

echo "Starting VX Engine deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci --only=production

# Run database migrations (if any)
# npm run migrate

# Build application (if needed)
# npm run build

# Restart application
pm2 reload ecosystem.config.js --env production

echo "Deployment completed successfully!"
```

### `rollback.sh`
```bash
#!/bin/bash

# Rollback script
set -e

LAST_COMMIT=$(git rev-parse HEAD~1)

echo "Rolling back to commit: $LAST_COMMIT"

# Rollback code
git reset --hard $LAST_COMMIT

# Reinstall dependencies
npm ci --only=production

# Restart application
pm2 reload ecosystem.config.js --env production

echo "Rollback completed!"
```

Make scripts executable:
```bash
chmod +x deploy.sh rollback.sh
```

## Continuous Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to server
      run: |
        # Add your deployment commands here
        echo "Deploying to production server..."
```

This deployment guide provides comprehensive instructions for deploying VX Engine to various environments. Choose the deployment method that best fits your infrastructure and requirements. 