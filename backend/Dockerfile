FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /usr/src/app/controllers ./controllers
COPY --from=builder /usr/src/app/models ./models
COPY --from=builder /usr/src/app/routes ./routes
COPY --from=builder /usr/src/app/middleware ./middleware
COPY --from=builder /usr/src/app/config ./config
COPY --from=builder /usr/src/app/services ./services
COPY --from=builder /usr/src/app/seeders ./seeders
COPY --from=builder /usr/src/app/scripts ./scripts
COPY --from=builder /usr/src/app/server.js ./server.js
COPY --from=builder /usr/src/app/setup.js ./setup.js

RUN mkdir -p uploads

EXPOSE 5000
CMD ["node", "server.js"]
