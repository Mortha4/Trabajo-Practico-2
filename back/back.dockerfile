FROM node:23-alpine3.20

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY back/ .

RUN npx prisma generate

EXPOSE 3000

CMD npx prisma migrate reset --force && npm start
