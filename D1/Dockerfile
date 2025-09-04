# Use Node.js as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy root package files first
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy the entire project
COPY . .

# Change to frontend directory
WORKDIR /app/frontend

# Check if frontend has its own package.json and install if it exists
RUN if [ -f package.json ]; then npm install; fi

# Go back to root directory
WORKDIR /app

# Expose port 3000
EXPOSE 3000

# Start the development server from root (since your package.json is there)
CMD ["npm", "start"]