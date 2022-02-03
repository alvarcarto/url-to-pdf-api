# url-to-pdf-api (https://github.com/alvarcarto/url-to-pdf-api)
#
# build:
# docker build -t url-to-pdf-api .
#
# run:
# docker run -i -e API_TOKENS=${PDF_SERVICE_API_KEY} -t --add-host=host.docker.internal:host-gateway -p 9000:9000 url-to-pdf-api
#
#
FROM node:10
WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -yq \
        gconf-service libasound2 libatk1.0-0 libc6 \
        libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
        libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
        libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 \
        libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
        libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
        libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation \
        libappindicator1 libnss3 lsb-release xdg-utils wget \
# Install fonts from heroku-buildpack-converter-fonts
        gsfonts \
    && rm -r /var/lib/apt/lists/*

COPY package.json .
COPY package-lock.json .

RUN yarn install --frozen-lockfile

COPY . .

ENV NODE_ENV development
ENV PORT 9000
EXPOSE 9000
ENV ALLOW_HTTP=true

# Warning: PDF rendering does not work in Chrome when it is in headed mode.
ENV DEBUG_MODE=false

CMD ["node", "src/index.js"]
