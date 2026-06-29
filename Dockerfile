# Multi-stage build for CampusFind Full Stack

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Stage 2: Build backend dependencies
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --only=production

# Stage 3: Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy backend from builder
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# Copy backend application files (no changes)
COPY backend/ ./backend/

# Copy frontend build output
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create uploads directory for file storage
RUN mkdir -p ./backend/uploads

# Set working directory to backend
WORKDIR /app/backend

# Expose the API port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["npm", "start"]
