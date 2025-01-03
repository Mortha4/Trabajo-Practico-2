FROM node:23-alpine3.20 
 
WORKDIR /BrakingBadTCG

COPY package*.json .

COPY package*.json ./

RUN npm ci --production

COPY . .

EXPOSE 80

CMD ["npm", "start"]


