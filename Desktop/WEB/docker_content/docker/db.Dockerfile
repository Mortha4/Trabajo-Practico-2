FROM node:23-alpine3.20 

WORKDIR /BrakingBadTCG

COPY ./back/package*.json ./

RUN npm install

COPY ./back .

RUN npm install prisma @prisma/client
RUN npx prisma generate

RUN npx prisma migrate deploy

EXPOSE 3000

CMD ["npm", "run", "dev"]
