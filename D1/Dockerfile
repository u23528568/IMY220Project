# Use Node.js runtime as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build frontend
RUN npm run build

# Create uploads directory
RUN mkdir -p backend/uploads

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Change to backend directory and start server
WORKDIR /app/backend
CMD ["node", "server.js"]