// https://github.com/a8m/doqmentdb

var config = require('../config.json');

var DoQmentDB  = require('doqmentdb');
var connection = new (require('documentdb')
    .DocumentClient)(config.host, {masterKey: config.mkey});

var db = new DoQmentDB(connection, 'fxosHack20150214');
var docs = db.use('sheetBelt');

docs.schema({
    size_top: {type: Number, 'default': 0},
    size_bottom: {type: Number, 'default': 0},
    time: {type: Number, 'default': 0},
    date_index: {type: String, 'default': ''}
});

exports = module.exports = docs;
