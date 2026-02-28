# Multi-stage build for Fish Farm App

# Stage 1: Build the entire app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files for root, server, and client
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install root and server dependencies
RUN npm ci

# Copy server source
COPY server/ ./server/

# Copy client source and build
COPY client/ ./client/
RUN cd client && npm ci && npm run build

# Stage 2: Production server
FROM node:20-alpine
WORKDIR /app

# Copy server files and dependencies from builder
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server ./

# Copy built client files to be served by server
COPY --from=builder /app/client/dist ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "src/index.js"]
