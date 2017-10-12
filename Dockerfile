FROM node:8.6.0

RUN mkdir -p /app
COPY ./app.json /app/
COPY ./package.json /app/
WORKDIR /app
RUN yarn
RUN npm install

ENV PORT 3035
ENV NODE_ENV development

EXPOSE 3035

# docker build -t url-to-pdf-api .
# docker run -it -v ${PWD}/src:/app/src url-to-pdf-api
CMD ["node", "src", "server.js"]
