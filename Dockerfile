# ==========================================
# Stage 1: Dependencies & Build
# ==========================================
FROM oven/bun:alpine AS builder
WORKDIR /app

# Copy only package.json and lockfile to leverage Docker layer caching
# The wildcard (*) ensures it doesn't fail if bun.lockb doesn't exist yet
COPY package.json bun.lockb* ./

# Install dependencies
# NOTE: If this is for production, change to: RUN bun install --production
RUN bun install --production

# ==========================================
# Stage 2: Final Runtime Image
# ==========================================
FROM oven/bun:alpine
WORKDIR /app

# Copy the installed node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on (change 3000 if needed)
EXPOSE 5173

# Start the application
CMD ["bun", "run", "dev"]