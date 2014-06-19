var pipeline = require('stream-combiner'),
  geojsonStream = require('geojson-stream'),
  TransformStream = require('./transformStream'),
  QueryStream = require('./queryStream');

module.exports = function (opts) {
  var geojson = geojsonStream.parse(),
    transform = new TransformStream(opts.propertiesMap, opts.geometryColumnName, opts.srid),
    query = new QueryStream(opts);

  return pipeline(geojson, transform, query);
};
