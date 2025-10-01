# Frontend build stage
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Backend stage
FROM node:20-alpine
WORKDIR /app

# Copy backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist ./public

RUN mkdir -p uploads

EXPOSE 5000

CMD ["npm", "start"]