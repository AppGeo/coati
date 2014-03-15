'use strict';

var fs = require('fs'),
  pipeline = require('./pipeline');

module.exports = pipeline;

pipeline.go = function (options) {
  var stream = pipeline(options),
    onStart = options.onStart || makeNoop('start'),
    onComplete = options.onComplete || makeNoop('complete'),
    onData = options.onData || makeNoop('data');

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

function makeNoop(name) {
  var counter = 1;

  return function () {
    if (name) {
      console.log('noop' + counter + ' ' + name);
      counter++;
    }
  }
}
