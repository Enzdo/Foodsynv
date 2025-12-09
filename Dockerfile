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

# Build the backend by compiling TypeScript directly
RUN cd apps/backend && pnpm exec tsc -p tsconfig.json

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy backend application (including build output and package files)
COPY --from=builder /app/apps/backend ./apps/backend

# Install production dependencies only inside backend package
WORKDIR /app/apps/backend
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Expose port
EXPOSE 3333

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

# Start the application from compiled JS
CMD ["node", "build/bin/server.js"]
