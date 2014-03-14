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

QueryStream.prototype._transform = function (data, _, next) {
  var out,
  query = this.knex(this.tableName);

  if (this.operation === 'insert') {
    out = query.insert(data);
  }
  else if (this.operation === 'delete') {
    out = query.where(this.pk, data[this.pk])
      .del();
  }
  else if (this.operation === 'update') {
    out = query.where(this.pk, data[this.pk])
      .update(data);
  }
  out.then(function(v) {
    next(null, v);
  }, next);
};
