# ==========================================
# Stage 1: Build the React/Vite App
# ==========================================
FROM oven/bun:alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy your source code
COPY . .

# Build the frontend (this usually creates a 'dist' or 'build' folder)
# If your build command is different in package.json, update it here!
RUN bun run build

# ==========================================
# Stage 2: Serve with Nginx (Ultra Small)
# ==========================================
# Nginx Alpine is incredibly small (under 50MB disk usage)
FROM nginx:alpine

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy the built static files from the builder stage
# NOTE: Change '/app/dist' to '/app/build' if that's what your bundler outputs
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (standard HTTP port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]