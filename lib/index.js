'use strict';

  var fs = require('fs'),
  pipeline = require('./pipeline');
function noop() {}
function GJ2PG(options) {
  
}
module.exports = pipeline;
pipeline.go = function (options) {
  var stream = pipeline(options),
      onStart = options.onStart || noop,
      onComplete = options.onComplete || noop,
      onData = options.onData || noop;
  stream.on('finish', onComplete);
  stream.on('data', onData);
  onStart();
  return fs.createReadStream(options.inputPath).pipe(pipeline);
};


module.exports = GJ2PG;
