const Joi = require('joi');

const urlSchema = Joi.string().uri({
  scheme: [
    'http',
    'https',
  ],
});

const cookieSchema = Joi.object({
  name: Joi.string().required(),
  value: Joi.string().required(),
  url: Joi.string(),
  domain: Joi.string(),
  path: Joi.string(),
  expires: Joi.number().min(1),
  httpOnly: Joi.boolean(),
  secure: Joi.boolean(),
  sameSite: Joi.string().regex(/^(Strict|Lax)$/),
});

const sharedQuerySchema = Joi.object({
  attachmentName: Joi.string(),
  scrollPage: Joi.boolean(),
  emulateScreenMedia: Joi.boolean(),
  enableGPU: Joi.boolean(),
  ignoreHttpsErrors: Joi.boolean(),
  waitFor: Joi.alternatives([
    Joi.number().min(1).max(60000),
    Joi.string().min(1).max(2000),
  ]),
  cookies: Joi.array().items(cookieSchema),
  output: Joi.string().valid(['pdf', 'screenshot', 'html']),
  'viewport.width': Joi.number().min(1).max(30000),
  'viewport.height': Joi.number().min(1).max(30000),
  'viewport.deviceScaleFactor': Joi.number().min(0).max(100),
  'viewport.isMobile': Joi.boolean(),
  'viewport.hasTouch': Joi.boolean(),
  'viewport.isLandscape': Joi.boolean(),
  'goto.timeout': Joi.number().min(0).max(60000),
  'goto.waitUntil': Joi.string().min(1).max(2000),
  'pdf.scale': Joi.number().min(0).max(1000),
  'pdf.displayHeaderFooter': Joi.boolean(),
  'pdf.landscape': Joi.boolean(),
  'pdf.pageRanges': Joi.string().min(1).max(2000),
  'pdf.format': Joi.string().min(1).max(2000),
  'pdf.width': Joi.string().min(1).max(2000),
  'pdf.height': Joi.string().min(1).max(2000),
  'pdf.fullPage': Joi.boolean(),
  'pdf.footerTemplate': Joi.string(),
  'pdf.headerTemplate': Joi.string(),
  'pdf.margin.top': Joi.string().min(1).max(2000),
  'pdf.margin.right': Joi.string().min(1).max(2000),
  'pdf.margin.bottom': Joi.string().min(1).max(2000),
  'pdf.margin.left': Joi.string().min(1).max(2000),
  'pdf.printBackground': Joi.boolean(),
  'screenshot.fullPage': Joi.boolean(),
  'screenshot.quality': Joi.number().integer().min(0).max(100),
  'screenshot.type': Joi.string().valid(['png', 'jpeg']),
  'screenshot.clip.x': Joi.number(),
  'screenshot.clip.y': Joi.number(),
  'screenshot.clip.width': Joi.number(),
  'screenshot.clip.height': Joi.number(),
  'screenshot.selector': Joi.string().regex(/(#|\.).*/),
  'screenshot.omitBackground': Joi.boolean(),
});

const renderQuerySchema = Joi.object({
  url: urlSchema.required(),
}).concat(sharedQuerySchema);

const renderBodyObject = Joi.object({
  url: urlSchema,
  html: Joi.string(),
  attachmentName: Joi.string(),
  scrollPage: Joi.boolean(),
  ignoreHttpsErrors: Joi.boolean(),
  emulateScreenMedia: Joi.boolean(),
  cookies: Joi.array().items(cookieSchema),
  output: Joi.string().valid(['pdf', 'screenshot', 'html']),
  viewport: Joi.object({
    width: Joi.number().min(1).max(30000),
    height: Joi.number().min(1).max(30000),
    deviceScaleFactor: Joi.number().min(0).max(100),
    isMobile: Joi.boolean(),
    hasTouch: Joi.boolean(),
    isLandscape: Joi.boolean(),
  }),
  waitFor: Joi.alternatives([
    Joi.number().min(1).max(60000),
    Joi.string().min(1).max(2000),
  ]),
  goto: Joi.object({
    timeout: Joi.number().min(0).max(60000),
    waitUntil: Joi.string().min(1).max(2000),
  }),
  pdf: Joi.object({
    scale: Joi.number().min(0).max(1000),
    displayHeaderFooter: Joi.boolean(),
    landscape: Joi.boolean(),
    pageRanges: Joi.string().min(1).max(2000),
    format: Joi.string().min(1).max(2000),
    width: Joi.string().min(1).max(2000),
    height: Joi.string().min(1).max(2000),
    fullPage: Joi.boolean(),
    footerTemplate: Joi.string(),
    headerTemplate: Joi.string(),
    margin: Joi.object({
      top: Joi.string().min(1).max(2000),
      right: Joi.string().min(1).max(2000),
      bottom: Joi.string().min(1).max(2000),
      left: Joi.string().min(1).max(2000),
    }),
    printBackground: Joi.boolean(),
  }),
  screenshot: Joi.object({
    fullPage: Joi.boolean(),
    quality: Joi.number().integer().min(0).max(100),
    type: Joi.string().valid(['png', 'jpeg']),
    clip: {
      x: Joi.number(),
      y: Joi.number(),
      width: Joi.number(),
      height: Joi.number(),
    },
    selector: Joi.string().regex(/(#|\.).*/),
    omitBackground: Joi.boolean(),
  }),
  failEarly: Joi.string(),
});

const renderBodySchema = Joi.alternatives([
  Joi.string(),
  renderBodyObject,
]);

module.exports = {
  renderQuerySchema,
  renderBodySchema,
  sharedQuerySchema,
};

