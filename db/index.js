// https://github.com/a8m/doqmentdb

var config = require('../config.json');

var DoQmentDB  = require('doqmentdb');
var connection = new (require('documentdb')
    .DocumentClient)(config.host, {masterKey: config.mkey});

var db = new DoQmentDB(connection, 'fxosHack20150214');
var docs = db.use('sheetBelt');

docs.schema({
    name: {type: String, 'default': ''},
    img: {type: String, 'default': ''}
});
exports = module.exports = docs;
