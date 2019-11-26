[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/alvarcarto/url-to-pdf-api)

[![Build Status](https://travis-ci.org/alvarcarto/url-to-pdf-api.svg?branch=master)](https://travis-ci.org/alvarcarto/url-to-pdf-api)

# URL to PDF Microservice

> Web page PDF rendering done right. Microservice for rendering receipts, invoices, or any content. Packaged to an easy API.

![Logo](docs/logo.png)

**⚠️ WARNING ⚠️** *Don't serve this API publicly to the internet unless you are aware of the
risks. It allows API users to run any JavaScript code inside a Chrome session on the server.
It's fairly easy to expose the contents of files on the server. You have been warned!. See https://github.com/alvarcarto/url-to-pdf-api/issues/12 for background.*

**⭐️ Features:**

* Converts any URL or HTML content to a PDF file or an image (PNG/JPEG)
* Rendered with Headless Chrome, using [Puppeteer](https://github.com/GoogleChrome/puppeteer). The PDFs should match to the ones generated with a desktop Chrome.
* Sensible defaults but everything is configurable.
* Single-page app (SPA) support. Waits until all network requests are finished before rendering.
* Easy deployment to Heroku. We love Lambda but...Deploy to Heroku button.
* Renders lazy loaded elements. *(scrollPage option)*
* Supports optional `x-api-key` authentication. *(`API_TOKENS` env var)*

Usage is as simple as https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com. There's also a `POST /api/render` if you prefer to send options in the body.

**🔍 Why?**

This microservice is useful when you need to automatically produce PDF files
for whatever reason. The files could be receipts, weekly reports, invoices,
or any content.

PDFs can be generated in many ways, but one of them is to convert HTML+CSS
content to a PDF. This API does just that.

**🚀 Shortcuts:**

* [Examples](#examples)
* [API](#api)
* [I want to run this myself](#development)

## How it works

![](docs/heroku.png)

Local setup is identical except Express API is running on your machine
and requests are direct connections to it.

### Good to know

* **By default, page's `@media print` CSS rules are ignored**. We set Chrome to emulate `@media screen` to make the default PDFs look more like actual sites. To get results closer to desktop Chrome, add `&emulateScreenMedia=false` query parameter. See more at [Puppeteer API docs](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions).

* Chrome is launched with `--no-sandbox --disable-setuid-sandbox` flags to fix usage in Heroku. See [this issue](https://github.com/GoogleChrome/puppeteer/issues/290).

* Heavy pages may cause Chrome to crash if the server doesn't have enough RAM.

* Docker image for this can be found here: https://github.com/restorecommerce/pdf-rendering-srv


## Examples

*Note: the demo Heroku app runs on a free dyno which sleep after idle.
A request to sleeping dyno may take even 30 seconds.*

**The most minimal example, render google.com**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com

**The most minimal example, render google.com as PNG image**

https://url-to-pdf-api.herokuapp.com/api/render?output=screenshot&url=http://google.com


**Use the default @media print instead of @media screen.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&emulateScreenMedia=false

**Use scrollPage=true which tries to reveal all lazy loaded elements. Not perfect but better than without.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://www.andreaverlicchi.eu/lazyload/demos/lazily_load_lazyLoad.html&scrollPage=true

**Render only the first page.**

https://url-to-pdf-api.herokuapp.com/api/render?url=https://en.wikipedia.org/wiki/Portable_Document_Format&pdf.pageRanges=1

**Render A5-sized PDF in landscape.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&pdf.format=A5&pdf.landscape=true

**Add 2cm margins to the PDF.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&pdf.margin.top=2cm&pdf.margin.right=2cm&pdf.margin.bottom=2cm&pdf.margin.left=2cm

**Wait for extra 1000ms before render.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&waitFor=1000


**Download the PDF with a given attachment name**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&attachmentName=google.pdf

**Wait for an element matching the selector `input` appears.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&waitFor=input

**Render HTML sent in JSON body**

```bash
curl -o html.pdf -XPOST -d'{"html": "<body>test</body>"}' -H"content-type: application/json" https://url-to-pdf-api.herokuapp.com/api/render
```

**Render HTML sent as text body**

```bash
curl -o html.pdf -XPOST -d@page.html -H"content-type: text/html" https://url-to-pdf-api.herokuapp.com/api/render
```

## API

To understand the API options, it's useful to know how [Puppeteer](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md)
is internally used by this API. The [render code](https://github.com/alvarcarto/url-to-pdf-api/blob/master/src/core/render-core.js)
is quite simple, check it out. Render flow:

1. **`page.setViewport(options)`** where options matches `viewport.*`.
2. *Possibly* **`page.emulateMedia('screen')`** if `emulateScreenMedia=true` is set.
3. Render url **or** html.

    If `url` is defined, **`page.goto(url, options)`** is called and options match `goto.*`.
    Otherwise **`page.setContent(html, options)`** is called where html is taken from request body, and options match `goto.*`.

4. *Possibly* **`page.waitFor(numOrStr)`** if e.g. `waitFor=1000` is set.
5. *Possibly* **Scroll the whole page** to the end before rendering if e.g. `scrollPage=true` is set.

    Useful if you want to render a page which lazy loads elements.

6. Render the output

  * If output is `pdf` rendering is done with **`page.pdf(options)`** where options matches `pdf.*`.
  * Else if output is `screenshot` rendering is done with **`page.screenshot(options)`** where options matches `screenshot.*`.


### GET /api/render

All options are passed as query parameters.
Parameter names match [Puppeteer options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md).

These options are exactly the same as its `POST` counterpart, but options are
expressed with the dot notation. E.g. `?pdf.scale=2` instead of `{ pdf: { scale: 2 }}`.

The only required parameter is `url`.

Parameter | Type | Default | Description
----------|------|---------|------------
url | string | - | URL to render as PDF. (required)
output | string | pdf | Specify the output format. Possible values: `pdf` or `screenshot`.
emulateScreenMedia | boolean | `true` | Emulates `@media screen` when rendering the PDF.
ignoreHttpsErrors | boolean | `false` | Ignores possible HTTPS errors when navigating to a page.
scrollPage | boolean | `false` | Scroll page down before rendering to trigger lazy loading elements.
waitFor | number or string | - | Number in ms to wait before render or selector element to wait before render.
attachmentName | string | - | When set, the `content-disposition` headers are set and browser will download the PDF instead of showing inline. The given string will be used as the name for the file.
viewport.width | number | `1600` | Viewport width.
viewport.height | number | `1200` | Viewport height.
viewport.deviceScaleFactor | number | `1` | Device scale factor (could be thought of as dpr).
viewport.isMobile | boolean | `false` | Whether the meta viewport tag is taken into account.
viewport.hasTouch | boolean | `false` | Specifies if viewport supports touch events.
viewport.isLandscape | boolean | `false` | Specifies if viewport is in landscape mode.
cookies[0][name] | string | - | Cookie name (required)
cookies[0][value] | string | - | Cookie value (required)
cookies[0][url] | string | - | Cookie url
cookies[0][domain] | string | - | Cookie domain
cookies[0][path] | string | - | Cookie path
cookies[0][expires] | number | - | Cookie expiry in unix time
cookies[0][httpOnly] | boolean | - | Cookie httpOnly
cookies[0][secure] | boolean | - | Cookie secure
cookies[0][sameSite] | string | - | `Strict` or `Lax`
goto.timeout | number | `30000` |  Maximum navigation time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.
goto.waitUntil | string | `networkidle` | When to consider navigation succeeded. Options: `load`, `networkidle`. `load` = consider navigation to be finished when the load event is fired. `networkidle` = consider navigation to be finished when the network activity stays "idle" for at least `goto.networkIdleTimeout` ms.
goto.networkIdleInflight | number | `2` | Maximum amount of inflight requests which are considered "idle". Takes effect only with `goto.waitUntil`: 'networkidle' parameter.
goto.networkIdleTimeout | number | `2000` | A timeout to wait before completing navigation. Takes effect only with waitUntil: 'networkidle' parameter.
pdf.scale | number | `1` | Scale of the webpage rendering.
pdf.printBackground | boolean | `false`| Print background graphics.
pdf.displayHeaderFooter | boolean | `false` | Display header and footer.
pdf.headerTemplate | string | - | HTML template to use as the header of each page in the PDF. **Currently Puppeteer basically only supports a single line of text and you must use pdf.margins+CSS to make the header appear!** See https://github.com/alvarcarto/url-to-pdf-api/issues/77.
pdf.footerTemplate | string | - | HTML template to use as the footer of each page in the PDF. **Currently Puppeteer basically only supports a single line of text and you must use pdf.margins+CSS to make the footer appear!** See https://github.com/alvarcarto/url-to-pdf-api/issues/77.
pdf.landscape | boolean | `false` | Paper orientation.
pdf.pageRanges | string | - | Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages.
pdf.format | string | `A4` | Paper format. If set, takes priority over width or height options.
pdf.width | string | - | Paper width, accepts values labeled with units.
pdf.height | string | - | Paper height, accepts values labeled with units.
pdf.margin.top | string | - | Top margin, accepts values labeled with units.
pdf.margin.right | string | - | Right margin, accepts values labeled with units.
pdf.margin.bottom | string | - | Bottom margin, accepts values labeled with units.
pdf.margin.left | string | - | Left margin, accepts values labeled with units.
screenshot.fullPage | boolean | `true` | When true, takes a screenshot of the full scrollable page.
screenshot.type | string | `png` | Screenshot image type. Possible values: `png`, `jpeg`
screenshot.quality | number | - | The quality of the JPEG image, between 0-100. Only applies when `screenshot.type` is `jpeg`.
screenshot.omitBackground | boolean | `false` | Hides default white background and allows capturing screenshots with transparency.
screenshot.clip.x | number | - | Specifies x-coordinate of top-left corner of clipping region of the page.
screenshot.clip.y | number | - | Specifies y-coordinate of top-left corner of clipping region of the page.
screenshot.clip.width | number | - | Specifies width of clipping region of the page.
screenshot.clip.height | number | - | Specifies height of clipping region of the page.


**Example:**

```bash
curl -o google.pdf https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com
```


### POST /api/render - (JSON)

All options are passed in a JSON body object.
Parameter names match [Puppeteer options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md).

These options are exactly the same as its `GET` counterpart.

**Body**

The only required parameter is `url`.

```js
{
  // Url to render. Either url or html is required
  url: "https://google.com",

  // Either "pdf" or "screenshot"
  output: "pdf",

  // HTML content to render. Either url or html is required
  html: "<html><head></head><body>Your content</body></html>",

  // If we should emulate @media screen instead of print
  emulateScreenMedia: true,

  // If we should ignore HTTPS errors
  ignoreHttpsErrors: false,

  // If true, page is scrolled to the end before rendering
  // Note: this makes rendering a bit slower
  scrollPage: false,

  // Passed to Puppeteer page.waitFor()
  waitFor: null,

  // Passsed to Puppeteer page.setCookies()
  cookies: [{ ... }]

  // Passed to Puppeteer page.setViewport()
  viewport: { ... },

  // Passed to Puppeteer page.goto() as the second argument after url
  goto: { ... },

  // Passed to Puppeteer page.pdf()
  pdf: { ... },

  // Passed to Puppeteer page.screenshot()
  screenshot: { ... },
}
```

**Example:**

```bash
curl -o google.pdf -XPOST -d'{"url": "http://google.com"}' -H"content-type: application/json" https://url-to-pdf-api.herokuapp.com/api/render
```

```bash
curl -o html.pdf -XPOST -d'{"html": "<body>test</body>"}' -H"content-type: application/json" https://url-to-pdf-api.herokuapp.com/api/render
```

### POST /api/render - (HTML)

HTML to render is sent in body. All options are passed in query parameters.
Supports exactly the same query parameters as `GET /api/render`, except `url`
paremeter.

*Remember that relative links do not work.*

**Example:**

```bash
curl -o receipt.html https://rawgit.com/wildbit/postmark-templates/master/templates_inlined/receipt.html
curl -o html.pdf -XPOST -d@receipt.html -H"content-type: text/html" https://url-to-pdf-api.herokuapp.com/api/render?pdf.scale=1
```

## Development

To get this thing running, you have two options: run it in Heroku, or locally.

The code requires Node 8+ (async, await).

#### 1. Heroku deployment

Scroll this readme up to the Deploy to Heroku -button. Click it and follow
instructions.

**WARNING:** *Heroku dynos have a very low amount of RAM. Rendering heavy pages
may cause Chrome instance to crash inside Heroku dyno. 512MB should be
enough for most real-life use cases such as receipts. Some news sites may need
even 2GB of RAM.*


#### 2. Local development

First, clone the repository and cd into it.

* `cp .env.sample .env`
* Fill in the blanks in `.env`

* `npm install`
* `npm start` Start express server locally
* Server runs at http://localhost:9000 or what `$PORT` env defines


### Techstack

* Node 8+ (async, await), written in ES7
* [Express.js](https://expressjs.com/) app with a nice internal architecture, based on [these conventions](https://github.com/kimmobrunfeldt/express-example).
* Hapi-style Joi validation with [express-validation](https://github.com/andrewkeig/express-validation)
* Heroku + [Puppeteer buildpack](https://github.com/jontewks/puppeteer-heroku-buildpack)
* [Puppeteer](https://github.com/GoogleChrome/puppeteer) to control Chrome
