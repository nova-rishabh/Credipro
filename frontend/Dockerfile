FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

RUN npm ci

COPY frontend ./frontend

ARG REACT_APP_API_URL=http://localhost:3001
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build -w credipro-frontend

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve@14

COPY --from=build /app/frontend/build ./build

EXPOSE 80

CMD ["serve", "-s", "build", "-l", "80"]
