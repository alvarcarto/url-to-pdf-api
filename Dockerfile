FROM node:10-alpine

WORKDIR /usr/src/app

EXPOSE 9000

RUN apk upgrade --no-cache

COPY package*.json ./

RUN npm install --only=prod

COPY src src

CMD ["node", "src/index.js"]
