'use strict';

var geojsonStream = require('geojson-stream'),
  through = require('through2'),
  fs = require('fs'),
  db = require('./db'),
  Promise = require('bluebird'),
  numInsertedRows = 0,
  numTransformedRecords = 0;

function GJ2PG(options) {
  this.config = options.config;
  this.tableName = options.tableName;
  this.inputPath = options.inputFilePath;
  this.rawMap = options.propertiesMap;
  this.geometryColumn = options.geometryColumnName;
}

GJ2PG.prototype.go = function () {
  var self = this,
    tableName = this.tableName,
    inputPath = this.inputPath;
    rawMap = this.rawMap,
    geometryColumn = this.geometryColumn;

  this._tableExists(tableName).then(function (exists) {
    if (!exists) {
      console.log('The specified table, `' + tableName + '` does not exist.');
      process.exit(1);
    }

    var map = this._generateMap(rawMap, geometryColumn),
      input = fs.createReadStream('./' + inputPath),
      uploadStream = this._createUploadStream();

    input.pipe(geojsonStream.parse())
      .pipe(this._createTransformStream(map, tableName))
      .pipe(uploadStream);

    uploadStream.on('finish', function () {
      console.log('Inserted ' + numInsertedRows + ' of ' + numTransformedRecords + ' possible rows.');
    });

    return;
  }.bind(this));
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
  }

  return result;
};

GJ2PG.prototype._createColumns = function (columns) {
  if (Array.isArray(columns)) {
    return columns.join(',');
  }

  return columns;
};

GJ2PG.prototype._createPlaceholders = function (mappedProperties, hasGeometry) {
  var lastIndex,
    results = [];

  if (Array.isArray(mappedProperties)) {
    results = mappedProperties.map(function (item, index) {
      var num = index + 1,
        result = '$' + num;

      if (item === '^geometry') {
        result = 'ST_Multi(ST_GeomFromGeoJSON(' + result + '))';
      }

      return result;
    });
  }

  return results.join(',');
};

GJ2PG.prototype._createValues = function (mappedProperties, chunk) {
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

GJ2PG.prototype._createInsert = function (tableName, data) {
  if (!data || !tableName) {
    console.error('Invalid arguments');
    process.exit(1);
  }

  if (!data.columns || !data.placeholders || !data.values) {
    console.error('Partially complete arguments');
    process.exit(1);
  }

  return {
    text: 'INSERT INTO ' + tableName + ' (' + data.columns + ') VALUES(' + data.placeholders + ');',
    name: 'insert geojson data',
    values: data.values
  }
};

GJ2PG.prototype._createTransformStream = function (map, tableName) {
  var self = this;

  return through.obj(function (chunk, _, next) {
    var hasGeometry = chunk.geometry ? true : false,
      columns = self._createColumns(map.columns);
      values = self._createValues(map.properties, chunk),
      placeholders = self._createPlaceholders(map.properties, hasGeometry),
      query = self._createInsert(tableName, {
        placeholders: placeholders,
        columns: columns,
        values: values
      });

    this.push(query);
    numTransformedRecords += 1;

    next();
  });
};

GJ2PG.prototype._createUploadStream = function () {
  var self = this;

  return through.obj(function (chunk, _, next) {
    self._insertRow(chunk).then(function () {
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

GJ2PG.prototype._tableExists = function (tableName) {
  return db(this.config).then(function (con) {
    return con.query({
      text: 'SELECT EXISTS(SELECT * FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2);',
      name: 'table exists check',
      values: ['public', tableName]
    }).then(function (data) {
      con.done();
      return data && data.rows && data.rows[0].exists; 
    }, function (error) {
      console.error(error);
      con.done();
      return false;
    });
  });
};

GJ2PG.prototype._insertRow = function (query) {
  var config = this.config;

  return db(config).then(function (con) {
    return con.query(query).then(function () {
      con.done();
      return true;
    }, function (e) {
      con.done();
      throw e;
      return false;
    });
  });
};

module.exports = GJ2PG;
