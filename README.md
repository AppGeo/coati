# Coati [![Build Status][2]][3]

![coati][4]

Streams GeoJSON data to a PostGIS configured PostgreSQL database.

*Note: Casts all geometry using `ST_Multi`, let me know if this is a problem*

To get started, install `coati`, via `npm install --save coati`.


## Usage

```js
var coati = require('coati'),
  config = require('./config');

coati.go('insert', {
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
npm install -g coati
coati insert -f data.json -t providers -g geom 'OBJECTID:id, ProvName:name'
```

See help, via `coati -h` for more information and available options.


## Todo

* Figure out a more clear way to map properties/geometry property
* Up for suggestions..


## Special Thanks

To [Calvin Metcalf][1], who wrote most of the original code.

[1]: https://github.com/calvinmetcalf
[2]: https://travis-ci.org/AppGeo/coati.png?branch=master
[3]: https://travis-ci.org/AppGeo/coati
[4]: http://upload.wikimedia.org/wikipedia/commons/e/e0/Coati_%28PSF%29.jpg
