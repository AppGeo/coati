var QueryStream = require('../../lib/queryStream');

module.exports = function () {
  it('no options throws error', function () {
    QueryStream.should.throw(Error, 'Cannot read property \'config\' of undefined');
  });
};
