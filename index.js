'use strict';
require('babel-register')({
  ignore: false,
  extensions: ['.es6'],
});
module.exports = require('./lib/main');
