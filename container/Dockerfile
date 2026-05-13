FROM node:18-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY agent/package*.json ./
RUN npm ci --only=production

COPY agent/ ./

USER node

EXPOSE 7878

ENTRYPOINT ["dumb-init", "node", "index.js"]
