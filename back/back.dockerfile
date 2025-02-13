FROM node:23-alpine3.20

WORKDIR /back

COPY package.json package-lock.json ./

RUN npm ci

ENTRYPOINT ["./startup.sh"]
