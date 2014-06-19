'use strict';

var fs = require('fs'),
  pipeline = require('./pipeline');

module.exports = pipeline;

pipeline.go = function (operation, pkColumnName, options) {
  if (typeof pkColumnName === 'object') {
    options = pkColumnName;
  }
  else {
    options.primaryKey = pkColumnName;
  }

  options.operation = operation || 'insert';

  var stream = pipeline(options),
    onStart = options.onStart || noop,
    onComplete = options.onComplete || noop,
    onData = options.onData || noop,
    onError = options.onError || defaultErrorHandler;

  stream.on('data', onData);
  stream.on('end', onComplete);
  stream.on('error', onError);

  onStart();

  return fs.createReadStream(options.inputFilePath).pipe(stream);
};

function noop() {
  // pass through
}

function defaultErrorHandler(error) {
  console.log(error);
  process.exit(1); 
}
