var TransformStream = require('../lib/transformStream');

module.exports = function () {
  var stream,
    data = {
      properties: {
        propOne: 'hi',
        test: 'bye'
      }
    };

  before(function () {
    var rawMap = 'propOne:prop1, test:name',
      geometryColumn = 'geom';

    stream = new TransformStream(rawMap, geometryColumn);
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

    values.should.deep.equal(['hi', 'bye']);
  });

  it('#_joinColumnsValues: join columns to respective values', function () {
    var values = stream._buildValues(stream.map.properties, data),
      columns = stream.map.columns,
      joined = stream._joinColumnsValues(columns, values);

    joined.prop1.should.equal('hi');
    joined.name.should.equal('bye');
    joined.geom.should.exist;
  });
};
