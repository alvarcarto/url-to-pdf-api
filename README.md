# URL to PDF

> Web page PDF rendering done right. Packaged to an easy API.

A simple API which converts a given URL to a PDF. **Why is it "done right"?**

* Rendered with Headless Chrome, using [Puppeteer](https://github.com/GoogleChrome/puppeteer)
* Sensible defaults
* Easy deployment to Heroku. I love Lambda but.. Deploy to Heroku button.


**Requires Node 8+ (async, await).**

## Get started

* `cp .env.sample .env`
* Fill in the blanks in `.env`
* `source .env` or `bash .env`

  Or use [autoenv](https://github.com/kennethreitz/autoenv).

* `npm install`
* `npm start` Start express server locally
* Server runs at http://localhost:9000 or what `$PORT` env defines


## Techstack

* Node 8+ (async, await), written in ES7
* [Express.js](https://expressjs.com/) app with a nice internal architecture, based on [these conventions](https://github.com/kimmobrunfeldt/express-example).
* Hapi-style Joi validation with [express-validation](https://github.com/andrewkeig/express-validation)
* Heroku + [Puppeteer buildpack](https://github.com/jontewks/puppeteer-heroku-buildpack)
* [Puppeteer](https://github.com/GoogleChrome/puppeteer) to control Chrome
