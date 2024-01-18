FROM ghcr.io/browserless/chrome

ENV BROWSER_EXECUTABLE_PATH=$CHROME_PATH
ENV PORT=9000

USER root

RUN apt update -y \
  && curl -sL https://deb.nodesource.com/setup_18.x | bash - \
  && apt install -y fonts-dejavu ttf-mscorefonts-installer gnupg nodejs \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

USER node

ENV HOME=/home/node
ARG APP_HOME=/home/node/srv
WORKDIR $APP_HOME

RUN git clone --depth 1 https://github.com/trusted/url-to-pdf-api.git . \
  && npm install --only=production

EXPOSE 9000
CMD [ "node", "." ]
