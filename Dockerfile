FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY index.js ./

# Create directory for persistent data
RUN mkdir -p /app/data

# Run the bot
CMD ["node", "index.js"]
