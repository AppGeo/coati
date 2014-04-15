'use strict';

var fs = require('fs'),
  pipeline = require('./pipeline');

module.exports = pipeline;

pipeline.go = function (operation, pkColumnName, options) {
  if (typeof pkColumnName === 'object') {
    options = pkColumnName;
  }

  options.operation = operation || 'insert';
  options.primaryKey = pkColumnName;

  var stream = pipeline(options),
    onStart = options.onStart || noop,
    onComplete = options.onComplete || noop,
    onData = options.onData || noop;

  stream.on('data', onData);
  stream.on('end', onComplete);
  stream.on('error', function (error) {
    console.log(error);
  });

  onStart();

  return fs.createReadStream(options.inputFilePath).pipe(stream);
};

function noop() {
  // pass through
}
