#! /usr/bin/env node

/**
  Usage:

  gj2pg -f states.geojson -t table 

  -f filePath - required, *.json or *.geojson
  -c configPath - optional, if not specified then looks in the current directory for `config.json`
  -t databaseTable - required, uses existing table
  -m map - optional, maps geojson attributes to columns
  -S schema - optional, defaults to 'public'
*/
var GJ2PG = require('./index'),
  argv = require('minimist')(process.argv.slice(2)),
  fs = require('fs');

function init() {
  var options = getCliOptions();
  
  var gj2pg = new GJ2PG(options);

  gj2pg.go();
}

module.exports = init();

function getCliOptions() {
  var filePath = argv.f,
    configPath = argv.c,
    databaseTable = argv.t,
    propertiesMap = argv.m.split(','),
    geometryColumn = argv.g,
    schema = argv.S,
    config;

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

  return {
    inputFilePath: filePath,
    config: config,
    tableName: databaseTable,
    propertiesMap: propertiesMap,
    geometryColumnName: geometryColumn,
    schema: schema
  };
}
