'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var server = require('http').createServer(app);
var WebSocketServer = require('ws').Server;
var sheetDB = require('./db/index')
var port = process.env.PORT || 8000;


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb' }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Start server
server.listen(port,process.env.OPENSHIFT_NODEJS_IP || process.env.IP || undefined
  , function () {
  console.log('Express server listening on %d, in %s mode', port, app.get('env'));
});

// データを取得
app.get('/api/hello', function (req, res) {
  console.log('test');
  sheetDB.create({
      name: 'test',
      img: 'test'
    }).catch(console.log);
  res.json({'message': 'world'});
});

/* Web Socket */

var wss = new WebSocketServer({server: server});
console.log('websocket server created');
wss.on('connection', function(ws) {
    var id = setInterval(function() {
      console.log('interval..')
      ws.send(JSON.stringify(new Date()), function() {  });
    }, 1000);

    console.log('websocket connection open');

    ws.on('close', function() {
      console.log('websocket connection close');
      clearInterval(id);
    });
});
/* Web Socket : End*/

/*******/
exports = module.exports = app;
/*******/


