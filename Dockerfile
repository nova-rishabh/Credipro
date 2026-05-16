FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY contracts ./contracts

# Build TypeScript
RUN npm run build

# Build frontend (if included)
# COPY frontend ./frontend
# WORKDIR /app/frontend
# RUN npm install && npm run build
# WORKDIR /app

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start:backend"]
