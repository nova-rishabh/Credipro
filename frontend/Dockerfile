FROM node:20-bookworm-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY public ./public
COPY src ./src
COPY config-overrides.js tsconfig.json server.js ./
RUN CI=false npm run build

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
