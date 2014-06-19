# Coati [![Build Status][2]][3]

![coati][4]

Streams GeoJSON data to a PostGIS configured PostgreSQL database.

*Note: Casts all geometry using `ST_Multi`, let me know if this is a problem*


## Usage

To get started, install `coati`, via `npm install --save coati`.

```js
var coati = require('coati');
var config = require('./config');

coati.go('insert', {
  config: config,
  inputFilePath: 'data.json',
  tableName: 'countries',
  propertiesMap: ['ObjID:id', 'Country_Name:name'],
  geometryColumnName: 'geom'
});
```

The `config` format is JSON with the following structure:

```json
{
  "user": "test",
  "password": "password",
  "database": "myDb",
  "host": "localhost"
}
```


### Command Line

```
npm install -g coati
coati insert -f data.json -c db.config -t providers -g geom 'OBJECTID:id, ProvName:name'
```

See help, via `coati -h` for more information and available options.


## Todo

* Allow passing db arguments individually, e.g. `--db.name, --db.host, --db.user, --db.password`
* Up for suggestions..


## Special Thanks

To [Calvin Metcalf][1], who wrote most of the original code.


## License

License is located [here][5].

[1]: https://github.com/calvinmetcalf
[2]: https://travis-ci.org/AppGeo/coati.svg?branch=master
[3]: https://travis-ci.org/AppGeo/coati
[4]: http://upload.wikimedia.org/wikipedia/commons/e/e0/Coati_%28PSF%29.jpg
[5]: https://github.com/AppGeo/coati/blob/master/LICENSE.md
