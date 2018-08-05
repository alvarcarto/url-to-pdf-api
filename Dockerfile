FROM node:9-alpine

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROME_PATH /usr/bin/chromium-browser
ENV HOST 0.0.0.0
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
EXPOSE 9000
CMD [ "node", "src/index.js"]
