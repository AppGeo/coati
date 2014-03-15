var util = require('util'),
  Transform = require('readable-stream').Transform,
  Knex = require('knex');

util.inherits(TransformStream, Transform);
module.exports = TransformStream;

function TransformStream(rawMap, geometryColumn) {
  Transform.call(this, {
    objectMode: true,
    decodeStrings: false
  });

  this.geometryColumn = geometryColumn;
  this.map = genMap(rawMap, geometryColumn);
  // Not instantiating a connection, just for #raw
  this.knex = new Knex({ client:'pg' });
}

TransformStream.prototype._buildValues = function (mappedProperties, chunk) {
  var properties = chunk.properties,
    geometry = chunk.geometry,
    result = [];

  if (Array.isArray(mappedProperties)) {
    mappedProperties.forEach(function (item) {
      var prop;

      if (item === '^geometry' && geometry) {
        geometry.crs = getCRS();
        result.push(JSON.stringify(geometry));
      }
      else {
        prop = properties[item];

        if (prop) {
          result.push(prop);
        }
      }
    });

    return result;
  }
};

TransformStream.prototype._joinColumnsValues = function (columns, values) {
  var result = {};

  columns.forEach(function (item, index) {
    if (item === this.geometryColumn) {
      result[item] = this.knex.raw('ST_Multi(ST_GeomFromGeoJSON(\'' + values[index] + '\'))');
    }
    else {
      result[item] = values[index];  
    }
  }, this);

  return result;
};

TransformStream.prototype._transform = function (chunk, _, next) {
  var hasGeometry = chunk.geometry ? true : false,
    values = this._buildValues(this.map.properties, chunk),
    data = this._joinColumnsValues(this.map.columns, values);

  this.push(data);

  next();
};

function genMap(map, geometryColumn) {
  if (!map) {
    throw new Error('Must supply a map string in the format of `prop1:propA, prop2:propB`');
    process.exit(1);
  }

  if (typeof map === 'object' && Array.isArray(map.properties) && Array.isArray(map.columns)) {
    return map;
  }

  var result = {},
    columns = [],
    properties = [],
    mapArr;

  if (typeof map === 'string') {
    mapArr = map.split(',');
  }
  else if (Array.isArray(map)) {
    mapArr = map;
  }

  mapArr.forEach(function (item) {
    var split = item.trim().split(':');
    
    if (split && split.length === 2) {
      columns.push(split[1]);
      properties.push(split[0]);
    }
  });

  if (geometryColumn) {
    properties.push('^geometry');
    columns.push(geometryColumn);
  }

  result.properties = properties;
  result.columns = columns;

  return result;
}

function getCRS(srid) {
  srid = srid || 'EPSG:4326';

  return {
    type: 'name',
    properties: {
      name: srid
    }
  };
}
