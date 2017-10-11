const path = require('path');
const fs = require('fs');

function getResource(name) {
  const filePath = path.join(__dirname, '../resources', name);
  return fs.readFileSync(filePath, { encoding: 'utf-8' });
}

module.exports = {
  getResource,
};
