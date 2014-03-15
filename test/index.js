var chai = require('chai'),
  transformStreamTests = require('./transform-stream'),
  queryStreamTests = require('./query-stream'),
  pipelineTests = require('./pipeline');

chai.should();

describe('TransformStream', transformStreamTests);
describe('QueryStream', queryStreamTests);
describe('Pipeline', pipelineTests);
