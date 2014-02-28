var pipeline = require('stream-combiner'),
    Transform = require('./transformStream'),
    QueryStream = require('./queryStream'),
    geojsonStream = require('geojson-stream');

module.exports = function (opts) {
  var transform = new Transform(opts.propertiesMap, opts.geometryColumnName),
      query = new QueryStream(opts);
  return pipeline(geojsonStream.parse(), transform, query);
};