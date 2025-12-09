# ============================================
# 🐳 QIANLUNSHOP BACKEND - Multi-stage Build
# Optimized Node.js Docker Image
# ============================================

# ==========================================
# Stage 1: Base
# ==========================================
FROM node:20-alpine AS base

# Update packages and install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# ==========================================
# Stage 2: Dependencies (Development)
# ==========================================
FROM base AS dependencies-dev

# Install all dependencies (including devDependencies)
RUN npm ci --include=dev

# ==========================================
# Stage 3: Dependencies (Production)
# ==========================================
FROM base AS dependencies-prod

# Install only production dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# ==========================================
# Stage 4: Development
# ==========================================
FROM base AS development

# Copy dev dependencies
COPY --from=dependencies-dev /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs && chmod 755 logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start with nodemon for hot reload
CMD ["npm", "run", "dev"]

# ==========================================
# Stage 5: Builder (for production build)
# ==========================================
FROM base AS builder

# Copy prod dependencies
COPY --from=dependencies-prod /app/node_modules ./node_modules

# Copy source
COPY . .

# Build if needed (e.g., TypeScript compilation)
# RUN npm run build

# ==========================================
# Stage 6: Production
# ==========================================
FROM node:20-alpine AS production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Create logs directory with proper permissions
RUN mkdir -p logs && \
    chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["node", "server.js"]