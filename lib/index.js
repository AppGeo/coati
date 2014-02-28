'use strict';

var geojsonStream = require('geojson-stream'),
  Knex = require('knex'),
  through = require('through2'),
  fs = require('fs'),
  Promise = require('bluebird'),
  numInsertedRows = 0,
  numTransformedRecords = 0,
  operationMap = {
    'insert': 'Inserted',
    'delete': 'Deleted',
    'update': 'Updated'
  };

function GJ2PG(options) {
  this.config = options.config;
  this.tableName = options.tableName;
  this.inputPath = options.inputFilePath;
  this.rawMap = options.propertiesMap;
  this.geometryColumn = options.geometryColumnName;
  this.schema = options.schema || 'public';
  this.operation = options.operation || 'insert';
  this.pk = options.pk || 'id';

  this.knex = Knex.initialize({
    client: 'pg',
    connection: this.config
  });
}

GJ2PG.prototype.go = function () {
  var self = this,
    tableName = this.tableName,
    inputPath = this.inputPath,
    rawMap = this.rawMap,
    schema = this.schema,
    geometryColumn = this.geometryColumn,
    hasTable = this.knex.schema.hasTable;

  hasTable(tableName).then(function (exists) {
    if (!exists) {
      console.log('The specified table, `' + tableName + '` does not exist in `' + schema + '` schema.');
      process.exit(1);
    }

    var map = self._generateMap(rawMap, geometryColumn),
      input = fs.createReadStream('./' + inputPath),
      uploadStream = self._createUploadStream();

    input.pipe(geojsonStream.parse())
      .pipe(self._createTransformStream(map, tableName))
      .pipe(uploadStream);

    uploadStream.on('finish', function () {
      console.log('%s %d of %d possible rows.', operationMap[self.operation], numInsertedRows, numTransformedRecords);
      process.exit();
    });

    return;
  });
};

/* PRIVATE METHODS */

GJ2PG.prototype._generateMap = function (map, geometryColumn) {
  if (!map) {
    console.log('Must supply a map string in the format of `prop1:propA, prop2:propB`');
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
};

GJ2PG.prototype._joinColumnsValues = function (columns, values) {
  var result = {},
    knex = this.knex,
    geometryColumn = this.geometryColumn;

  columns.forEach(function (item, index) {
    if (item === geometryColumn) {
      result[item] = knex.raw('ST_Multi(ST_GeomFromGeoJSON(\'' + values[index] + '\'))');
    }
    else {
      result[item] = values[index];  
    }
  });

  return result;
};

GJ2PG.prototype._buildValues = function (mappedProperties, chunk) {
  var properties = chunk.properties,
    geometry = chunk.geometry,
    result = [];

  if (Array.isArray(mappedProperties)) {
    mappedProperties.forEach(function (item) {
      var prop;

      if (item === '^geometry' && geometry) {
        geometry.crs = GJ2PG.getCRS();
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

GJ2PG.prototype._createTransformStream = function (map, tableName) {
  var self = this;

  return through.obj(function (chunk, _, next) {
    var hasGeometry = chunk.geometry ? true : false,
      values = self._buildValues(map.properties, chunk),
      data = self._joinColumnsValues(map.columns, values);

    this.push(data);
    numTransformedRecords += 1;

    next();
  });
};

GJ2PG.prototype._createUploadStream = function () {
  var knex = this.knex,
    tableName = this.tableName,
    operation = this.operation,
    pk = this.pk;

  return through.obj(function (data, _, next) {
    var query = knex(tableName);

    if (operation === 'insert') {
      query = query.insert(data);
    }
    else if (operation === 'delete') {
      query = query.where(pk, data[pk])
        .del();
    }
    else if (operation === 'update') {
      query = query.where(pk, data[pk])
        .update(data);
    }

    query.then(function () {
      numInsertedRows += 1;
      next();
    }, next);
  });
};

GJ2PG.getCRS = function (srid) {
  srid = srid || 'EPSG:4326';

  return {
    type: 'name',
    properties: {
      name: srid
    }
  };
};

module.exports = GJ2PG;
