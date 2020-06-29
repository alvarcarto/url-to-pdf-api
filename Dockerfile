FROM node:14-alpine

WORKDIR /usr/src/app

EXPOSE 9000

RUN apk add -U --no-cache --allow-untrusted udev ttf-freefont chromium git
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser
ENV BROWSER_EXECUTABLE_PATH /usr/bin/chromium-browser


COPY package*.json ./

RUN npm install --only=prod

COPY src src

CMD [ "node", "src/index.js" ]
