#! /usr/bin/env node

/**
  Usage:

  gj2pg -f states.geojson -t table 

  -f filePath - required, *.json or *.geojson
  -c configPath - optional, if not specified then looks in the current directory for `config.json`
  -t databaseTable - required, uses existing table
  -m map - optional, maps geojson attributes to columns
  -S schema - optional, defaults to 'public'
  -o operation - optional, defaults to 'insert'. Options are insert, update, delete
  -p pk - optional, used with update/delete operations
  -v - returns the version
*/
var pipeline = require('./index'),
  argv = require('minimist')(process.argv.slice(2)),
  Spinner = require('cli-spinner').Spinner,
  fs = require('fs'),
  spinner = new Spinner('processing..');


function init() {
  var options = getCliOptions();
  
  pipeline.go(options);
}

module.exports = init();

function getCliOptions() {
  var filePath = argv.f,
    configPath = argv.c,
    databaseTable = argv.t,
    propertiesMap = argv.m,
    geometryColumn = argv.g,
    schema = argv.S,
    operation = argv.o,
    pk = argv.p,
    version = argv.v,
    config;

  if (version) {
    console.log(require('../package').version);
    process.exit();
  }

  if (!filePath) {
    console.log('Please specify a file path to process using the `-f` argument');
    process.exit(1);
  }

  if (!databaseTable) {
    console.log('Please specify a table to insert data into, using the `-t` argument');
    process.exit(1);
  }

  if (configPath) {
    config = require(process.cwd() + '/' + configPath);
  }

  if (!config) {
    config = require(process.cwd() + '/config');

    if (!config) {
      console.log('A config file is required, use `-c` argument or run in the same location as a `config.json` files');
      process.exit(1);
    }
  }

  if (propertiesMap && typeof propertiesMap === 'string') {
    propertiesMap = propertiesMap.split(',');
  }

  return {
    inputFilePath: filePath,
    config: config,
    tableName: databaseTable,
    propertiesMap: propertiesMap,
    geometryColumnName: geometryColumn,
    schema: schema,
    operation: operation,
    pk: pk,
    onStart: function () {
      spinner.start();
    },
    onComplete: function () {
      spinner.stop();
    }
  };
}
