var pipeline = require('../../lib/pipeline');

module.exports = function () {
  it('no options throws error', function () {
    pipeline.should.throw(TypeError, /propertiesMap/); 
  });
};
