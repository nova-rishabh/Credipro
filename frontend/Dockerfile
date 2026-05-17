# syntax=docker/dockerfile:1
# Build from repo root: docker compose build frontend
FROM node:20-bookworm-slim

WORKDIR /app

# Install dependencies (cached until package files change)
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

RUN --mount=type=cache,target=/root/.npm \
    npm ci -w credipro-frontend

# Build React app (cached until frontend source changes)
COPY frontend ./frontend

ARG REACT_APP_API_URL=http://localhost:3001
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build -w credipro-frontend

WORKDIR /app/frontend

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
