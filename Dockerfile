# VX Engine Dockerfile for Local Development
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install MongoDB client tools (for backup script)
RUN apk add --no-cache mongodb-tools gzip

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose application port
EXPOSE 3008

# Start the application
CMD ["npm", "run", "dev"]

