'use strict';

var pg = require('pg.js'),
    Promise = require('bluebird'),
    connect = Promise.promisify(pg.connect, pg),
    QueryStream = require('pg-query-stream');

function makeClient(config) {
  return connect(config).then(function (response) {
    var client = response[0];

    return {
      query: Promise.promisify(client.query, client),
      done: response[1],
      stream: function (text, values, options) {
        return client.query(new QueryStream(text, values, options));
      }
    };
  }, function (error) {
    console.error('Auth Error:', error);
    process.exit(1);
  });
};

module.exports = makeClient;
