# --- Backend Production Stage ---
FROM node:20-alpine

WORKDIR /app

# Install dependencies separately for layer caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "src/index.js"]
