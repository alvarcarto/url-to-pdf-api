FROM node:14.5-alpine

WORKDIR /usr/src/app
ENV NODE_ENV production
ENV PORT 10000
EXPOSE 10000

RUN npm install env-cmd
COPY package.json .
RUN npm install

COPY . .

CMD npm start
