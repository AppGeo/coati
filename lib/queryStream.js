var util = require('util');
    Transform = require("readable-stream").Transform,
    Knex = require('knex');
util.inherits(QueryStream, Transform);
module.exports = QueryStream;
function QueryStream(opts) {
  Transform.call(this, {
    objectMode: true,
    decodeStrings: false
  });
  var knex = Knex.initialize({
    client: 'pg',
    connection: opts.config
  });
  this.query = knex(opts.tableName);
  this.pk = opts.pk || 'id';
  his.operation = opts.operation || 'insert';
};
QueryStream.prototype._tranform = function (data, _, next) {
  var out;
  if (this.operation === 'insert') {
    out = this.query.insert(data);
  }
  else if (this.operation === 'delete') {
    out = this.query.where(this.pk, data[this.pk])
      .del();
  }
  else if (this.operation === 'update') {
    out = this.query.where(this.pk, data[this.pk])
      .update(data);
  }

  out.then(function () {
    next(1);
  }, next);
};