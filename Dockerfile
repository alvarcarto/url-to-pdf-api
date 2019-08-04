FROM node:12.7.0-alpine as printService

RUN apk add --no-cache make gcc g++

WORKDIR /app

ENV NODE_ENV production
ENV PORT 80
ENV ALLOW_HTTP true
ENV DEBUG false

COPY package.json .
COPY yarn.lock .

RUN yarn --pure-lockfile

COPY . .

EXPOSE 80

ADD ./docker/docker_start.sh /app/
CMD /app/docker_start.sh