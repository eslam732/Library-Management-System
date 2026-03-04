# ── Build stage ──────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# ── Production stage ────────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

# Set ownership
RUN chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
