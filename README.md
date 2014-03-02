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

See help, via `gj2pg -h` for more information and available options.


## Todo

* Figure out a more clear way to map properties/geometry property
* Up for suggestions..


## Special Thanks

To [Calvin Metcalf][1], who wrote most of the original code.

[1]: https://github.com/calvinmetcalf
