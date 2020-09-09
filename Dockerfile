FROM node:8.17.0-alpine

RUN apk add bash less zip ttf-freefont ttf-opensans ttf-ubuntu-font-family \
      ttf-inconsolata ttf-liberation ttf-dejavu

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
COPY ./fonts/ /usr/share/fonts

RUN yarn build

EXPOSE 9000

CMD [ "node", "dist/index.js" ]
