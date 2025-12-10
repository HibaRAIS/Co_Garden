# Service Catalogue - Dockerfile
FROM node:20-alpine

# Install OpenSSL for Prisma and build dependencies for bcrypt
RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
