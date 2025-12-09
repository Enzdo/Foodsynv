# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code
COPY . .

# Build the backend
RUN cd apps/backend && npx tsx bin/console.ts build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built application
COPY --from=builder /app/apps/backend/build ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Expose port
EXPOSE 3333

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

# Start the application
CMD ["node", "bin/server.js"]
