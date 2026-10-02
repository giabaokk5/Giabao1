# Stage 1: Build React Frontend
FROM node:20-alpine AS build-client
WORKDIR /app

# Install frontend dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source and build
COPY . .
RUN npm run build

# Stage 2: Production Runtime with Express Backend
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install backend dependencies (production only)
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy backend application
COPY server/ ./server/

# Copy built React frontend from Stage 1
COPY --from=build-client /app/build ./build

# Expose container port
EXPOSE 5000

# Persistent storage volume for database and uploads
VOLUME ["/app/server/data"]

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the fullstack application
CMD ["node", "server/index.js"]
