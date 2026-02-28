# Multi-stage build for Fish Farm App

# Stage 1: Build the client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine
WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./

# Copy built client files to be served by server
COPY --from=client-builder /app/client/dist ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "src/index.js"]
