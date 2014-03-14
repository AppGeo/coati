var chai = require('chai'),
  GJ2PG = require('../lib');

chai.should();


describe('GenerateMap', function () {
  var gj;

  before(function () {
    gj = new GJ2PG();
  });

  it('basic raw map translates to map', function () {
    var rawMap = 'propOne:prop1, test:name';
    var geometryColumn = 'geom';
    var map = gj._generateMap(rawMap, geometryColumn);
    var expected = {
      properties: ['propOne', 'test', '^geometry'],
      columns: ['prop1', 'name', 'geom']
    };

    map.should.deep.equal(expected);
  });
});
