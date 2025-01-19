FROM node:23-alpine3.20

WORKDIR /app

COPY back/package.json back/package-lock.json ./

RUN npm ci

COPY back/ .

RUN npx prisma generate

EXPOSE 3000

ENTRYPOINT ["./startup.sh"]
