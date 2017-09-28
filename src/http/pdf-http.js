const ex = require('../util/express');
const pdfCore = require('../core/pdf-core');

const getRender = ex.createJsonRoute((req) => {
  const params = {
    url: req.query.url,
  };

  return pdfCore.render(params);
});

module.exports = {
  getRender,
};
