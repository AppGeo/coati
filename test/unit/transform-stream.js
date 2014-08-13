var TransformStream = require('../../lib/transformStream');

module.exports = function () {
  var stream,
    rawMap,
    geometryColumn,
    data = {
      geometry: {},
      properties: {
        propOne: 'hi',
        test: 'bye'
      }
    };

  before(function () {
    rawMap = 'propOne:prop1, test:name';
    geometryColumn = 'geom';
    stream = new TransformStream(rawMap, geometryColumn, 'EPSG:4326');
  });

  it('no arguments throws error', function () {
    TransformStream.should.throw(Error, 'Must supply a map string in the format of `prop1:propA, prop2:propB`');
  });

  it('#constructor: basic raw map translates to map', function () {
    var map = stream.map,
      expected = {
        properties: ['propOne', 'test', '^geometry'],
        columns: ['prop1', 'name', 'geom']
      };

    map.should.deep.equal(expected);
  });

  it('#_buildValues: build values from map.properties + data', function () {
    var properties = stream.map.properties,
      values = stream._buildValues(properties, data);

    values.should.deep.equal(['hi', 'bye', '{"crs":{"type":"name","properties":{"name":"EPSG:4326"}}}']);
  });

  it('#_joinColumnsValues: join columns to respective values', function () {
    var values = stream._buildValues(stream.map.properties, data),
      columns = stream.map.columns,
      joined = stream._joinColumnsValues(columns, values);

    joined.prop1.should.equal('hi');
    joined.name.should.equal('bye');
    joined.geom.should.exist;
  });

  it('#_createCRS passed or default', function () {
    var srid = 'EPSG:4326',
      obj = function (srid) { 
        return {
          type: 'name',
          properties: {
            name: srid
          }
        };
      },
      defaultCRS = obj(srid),
      customCRS = obj('custom');

    stream._createCRS().should.deep.equal(defaultCRS);
    new TransformStream(rawMap, geometryColumn, 'custom')
      ._createCRS().should.deep.equal(customCRS);
  });
};
