FROM node:18-bullseye-slim

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install system dependencies for Puppeteer and Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-liberation \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxshmfence1 \
    libssl1.1 \
    wget \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copy backend source code
COPY backend/ .

# Generate Prisma client
RUN npx prisma generate

# Expose backend port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
