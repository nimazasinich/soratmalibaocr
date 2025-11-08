# Backend Dockerfile
FROM node:18-alpine

# Install Tesseract OCR and dependencies
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-fas \
    tesseract-ocr-data-eng \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create necessary directories
RUN mkdir -p /app/database /app/uploads /app/logs

# Expose port
EXPOSE 8000

# Start application
CMD ["npm", "start"]
