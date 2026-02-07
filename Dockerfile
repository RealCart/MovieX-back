# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# сначала зависимости (чтобы кешировалось)
COPY package*.json ./
RUN npm ci --omit=dev

# потом код
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]