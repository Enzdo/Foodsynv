# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace/package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copy app sources needed for workspace install
COPY apps ./apps

# Install backend workspace dependencies
RUN pnpm install --filter @foodsync/backend... --frozen-lockfile || pnpm install --filter @foodsync/backend...

# Copy remaining source code (if any)
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
