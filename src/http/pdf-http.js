const ex = require('../util/express');
const pdfCore = require('../core/pdf-core');

const getRender = ex.createRoute((req, res) => {
  const opts = {
    // TODO: add all params here
  };

  return pdfCore.render(req.query)
    .then((data) => {
      res.set('content-type', 'application/pdf');
      res.send(data);
    });
});

const postRender = ex.createRoute((req, res) => {
  return pdfCore.render(req.body)
    .then((data) => {
      res.set('content-type', 'application/pdf');
      res.send(data);
    });
});

module.exports = {
  getRender,
  postRender
};
