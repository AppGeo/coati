# gj2pg

Streams geoJSON data to a PostGIS configured PostgreSQL database.

*Note: Casts all geometry using `ST_Multi`, let me know if this is a problem*

To get started, install `gj2pg`, via `npm install --save gj2pg`.

## Usage

```js
var GJ2PG = require('gj2pg'),
  config = require('./config'),
  gj2pg;

  gj2pg = new GJ2PG({
    config: config,
    inputFilePath: 'data.json',
    tableName: 'countries',
    propertiesMap: ['ObjID:id', 'Country_Name:name'],
    geometryColumnName: 'geom'
  });

  gj2pg.go();
```

The `config` format is JSON in the following format:

```json
{
  "user": "test",
  "password": "password",
  "database": "myDb"
}
```

### Command Line

```
npm install -g gj2pg
gj2pg -f data.json -t providers -m 'OBJECTID:id, ProvName:name' -g geom
```

Also accepts `-c` for config file path, but looks for `config.json` or `config.js` that exports a JSON object (see above for format).

## Todo

* Figure out a more clear way to map properties/geometry property
* Up for suggestions..
* Split out CLI app to own repo
* Add help to CLI
