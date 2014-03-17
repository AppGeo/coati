'use strict';

var fs = require('fs'),
  pipeline = require('./pipeline');

module.exports = pipeline;

pipeline.go = function (options) {
  var stream = pipeline(options),
    onStart = options.onStart || noop,
    onComplete = options.onComplete || noop,
    onData = options.onData || noop;

  stream.on('data', onData);
  stream.on('finish', function () {
    console.log('ended');
  });
  stream.on('error', function (error) {
    console.log(error);
  });

  onStart();

  return fs.createReadStream(options.inputFilePath).pipe(stream);
};

function noop() {
  // pass through
}
