# BUILD STAGE
FROM node:23-slim AS builder

WORKDIR app

# Install dependencies
COPY ./app/package.json ./app/pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy codebase
COPY ./app .

# Build the application
RUN pnpm run build

# RUN STAGE
FROM nginx:alpine

# Copy built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the default Nginx port
# EXPOSE 80

# Start Nginx in the foreground
# CMD ["nginx", "-g", "daemon off;"]
