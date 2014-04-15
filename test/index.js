var chai = require('chai'),
  transformStreamTests = require('./unit/transform-stream'),
  queryStreamTests = require('./unit/query-stream'),
  pipelineTests = require('./unit/pipeline');

chai.should();

describe('Coati Unit:', function () {
  describe('TransformStream', transformStreamTests);
  describe('QueryStream', queryStreamTests);
  describe('Pipeline', pipelineTests);
});
