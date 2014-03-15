var pipeline = require('stream-combiner'),
    geojsonStream = require('geojson-stream'),
    Transform = require('./transformStream'),
    QueryStream = require('./queryStream');

module.exports = function (opts) {
  var geojson = geojsonStream.parse(),
    transform = new Transform(opts.propertiesMap, opts.geometryColumnName),
    query = new QueryStream(opts);

  return pipeline(geojson, transform, query);
};
