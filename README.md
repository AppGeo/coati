# Coati [![Build Status][2]][3]

![coati][4]

Streams GeoJSON data to a PostGIS configured PostgreSQL database.

*Note: Casts all geometry using `ST_Multi`, let me know if this is a problem*

To get started, install `gj2pg`, via `npm install --save gj2pg`.


## Usage

```js
var gj2pg = require('gj2pg'),
  config = require('./config');

gj2pg.go({
  config: config,
  inputFilePath: 'data.json',
  tableName: 'countries',
  propertiesMap: ['ObjID:id', 'Country_Name:name'],
  geometryColumnName: 'geom'
});
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
[2]: https://travis-ci.org/AppGeo/coati.png?branch=master
[3]: https://travis-ci.org/AppGeo/coati
[4]: http://upload.wikimedia.org/wikipedia/commons/e/e0/Coati_%28PSF%29.jpg
