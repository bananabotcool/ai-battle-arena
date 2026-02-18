FROM node:18-alpine

# Metadata
LABEL maintainer="BananaBot Studios"
LABEL description="AI Battle Arena - Epic AI agent combat simulator"
LABEL version="2.0.0"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files
COPY server/ ./server/
COPY public/ ./public/
COPY data/ ./data/

# Create data directory if not exists
RUN mkdir -p data && chmod 755 data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/agents || exit 1

# Start server
CMD ["node", "server/server.js"]
