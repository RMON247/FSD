# --- Frontend Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lockfile and package manifest first for efficient caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files and build
COPY . .
RUN npm run build

# --- Production Serving Stage (Nginx) ---
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
