# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace config files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copy frontend source
COPY apps/frontend ./apps/frontend

# Install dependencies for frontend only
RUN pnpm install --filter @foodsync/frontend... --frozen-lockfile

# Build the application
WORKDIR /app/apps/frontend
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy the built application from the builder stage
# Nuxt output is standalone in .output
COPY --from=builder /app/apps/frontend/.output ./.output

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"]
