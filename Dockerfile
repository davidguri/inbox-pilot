# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install

# Copy source code (including .env if it exists)
COPY . .

# Set build-time environment variables
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_KEY
ARG PUBLIC_HF_BASE
ARG PUBLIC_HF_TOKEN
ARG SUPABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY
ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_KEY=$PUBLIC_SUPABASE_KEY
ENV PUBLIC_HF_BASE=$PUBLIC_HF_BASE
ENV PUBLIC_HF_TOKEN=$PUBLIC_HF_TOKEN
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install production dependencies only
RUN bun install --production

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

# Expose the port the app runs on
EXPOSE 5173

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["bun", "run", "build/index.js"]

