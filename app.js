'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var server = require('http').createServer(app);
var WebSocketServer = require('ws').Server;
var sheetDB = require('./db/sheet')
var route = require('./route');
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

/* Web Socket */

// データを取得
app.get('/api/hello', function (req, res) {
  console.log('test');
  res.json({'message': 'world'});
});

// ユーザ一覧
app.get('/api/users', function (req, res) {
  console.log('get user');
  res.json([
  {
    "id":"1",
    "name":"父親",
    "size_top": "60",
    "size_bottom": "40"
  },{
    "id":"2",
    "name":"母親",
    "size_top": "50",
    "size_bottom": "35"
  },{
    "id":"3",
    "name":"息子",
    "size_top": "55",
    "size_bottom": "47"
  },{
    "id":"4",
    "name":"娘",
    "size_top": "45",
    "size_bottom": "30"
  }]);
});

// /api/current/:{id}
//使用者 @ パパしか帰らない
app.get('/api/current/:id', function (req, res) {
  console.log('get user detail');
  res.json({
    "id":"1",
    "name":"父親",
    "size_top": "60",
    "size_bottom": "40"
  });
});

// ベルトデータ
///api/sheetbelt/days/{day}
// {day} : YYYYMMDD
app.get('/api/sheetbelt/days/:day(20[0-9][0-9][0-1][0-9][0-3][0-9])', function (req, res) {
  var day = req.params.day;
  sheetDB.find({ date_index:day})
  .then(function(sheet){
    var retData =[];
    sheet.forEach(function(data){
      retData.push({
        "size_top"    :data.size_top,
        "size_bottom" :data.size_bottom,
        "time"        :data.time
      })
    });
    res.json({"photo_data": retData});
  });
});

/* Web Socket */

var saveDB = function(){
  var date = new Date();
  var mon = date.getMonth()+ 1;
  var monstr =''+(mon<=9 ? '0'+mon : mon);
  var fdt = ''+date.getFullYear() + monstr + date.getDate();
  sheetDB.create({
      size_top: posMix.is.top,
      size_bottom: posMix.is.bottom,
      time: date.getTime(),
      date_index: fdt
    }).catch(console.log);
  console.log(posMix.is.top, posMix.is.bottom)
}

var posMix={
  is:{
    top  :0,
    bottom:0
  },
  pushTop: function(len, next){
    posMix.is.top = len;
    if(posMix.is.bottom){
      posMix.sendNext(next);
    }
  },
  pushBottom: function(len, next){
    posMix.is.bottom = len;
    if(posMix.is.top){
      posMix.sendNext(next);
    }
  },
  sendNext:function(next){
    if (next) next();
    posMix.is.top=0;
    posMix.is.bottom=0;
  },
};

var wss = new WebSocketServer({server: server});

wss.on('connection', function(ws) {
  ws.on('message', function (data, flags) {
    //console.log('data', data)
    var data = JSON.parse(data);
    if (data.position)
      posMix.pushTop(data.len,   saveDB);
    else
      posMix.pushBottom(data.len,saveDB);
    //console.log(posMix.is.top, posMix.is.bottom)
  });

  console.log('websocket connection open');

  ws.on('close', function() {
    console.log('websocket connection close');
  });
});

/* Web Socket : End*/

/*******/
exports = module.exports = app;
/*******/


