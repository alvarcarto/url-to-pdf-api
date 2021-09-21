FROM node:12-alpine

RUN apk add --no-cache \
      bash \
      less \
      zip \
      ttf-freefont \
      ttf-opensans \
      ttf-ubuntu-font-family \
      ttf-inconsolata \
      ttf-liberation \
      ttf-dejavu \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
COPY ./fonts/ /usr/share/fonts

RUN yarn build

EXPOSE 9000

CMD [ "node", "dist/index.js" ]
