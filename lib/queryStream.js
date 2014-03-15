var util = require('util');
  Transform = require('readable-stream').Transform,
  Knex = require('knex');

util.inherits(QueryStream, Transform);
module.exports = QueryStream;

function QueryStream(opts) {
  Transform.call(this, {
    objectMode: true,
    decodeStrings: false
  });

  this.knex = Knex.initialize({
    client: 'pg',
    connection: opts.config
  });
  this.tableName = opts.tableName;
  this.pk = opts.pk || 'id';
  this.operation = opts.operation || 'insert';
}

QueryStream.prototype._buildQuery = function (data) {
  var out,
    query = this.knex(this.tableName);

  if (!data) {
    throw new Error('Invalid data object');  
  }

  if (this.operation === 'insert') {
    out = query.insert(data);
  }
  else {
    if (!data[this.pk]) {
      throw new Error('Primary key column not found in data object');
    }

    out = query.where(this.pk, data[this.pk]);

    if (this.operation === 'delete') {
      out.del();
    }
    else if (this.operation === 'update') {
      out.update(data);
    }
  }
  
  return out;
};

QueryStream.prototype._transform = function (data, _, next) {
  this._buildQuery(data)
    .then(function(v) {
      next(null, v);
    }, next);
};
