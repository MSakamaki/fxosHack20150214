// https://github.com/a8m/doqmentdb

var config = require('../config.json');

var DoQmentDB  = require('doqmentdb');
var connection = new (require('documentdb')
    .DocumentClient)(config.host, {masterKey: config.mkey});

var db = new DoQmentDB(connection, 'fxosHack20150214');
var docs = db.use('logs');

docs.schema({
    data: { type: Object, 'default': {}}
});

exports = module.exports = docs;
