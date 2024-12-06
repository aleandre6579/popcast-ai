# Use a lightweight Node.js image for the build stage
FROM node:23-slim as builder

# Set working directory
WORKDIR /frontend

# Install pnpm globally
RUN npm install -g pnpm

# Copy lockfile and package.json
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm run build

# Use a lightweight web server for serving the built app
FROM nginx:alpine

# Copy built files from the builder stage
COPY --from=builder /frontend/dist /usr/share/nginx/html

# Expose the default Nginx port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
