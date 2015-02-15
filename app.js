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
// 現在のtopとbottomの値
app.get('/api/current', function (req, res) {
  console.log('get user detail');
  res.json({
    "size_top":    body_len_top,
    "size_bottom": body_len_bottom 
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

/* 車から */
// 悪手:現在のベルト値
var body_len_top=0,
    body_len_bottom=0;
app.post('/api/car/sheet', function (req, res) {
  var data = req.body
  body_len_top = data.len_top;
  body_len_bottom = data.len_bottom;
  try{
    saveSheetDB(data.len_top, data.len_bottom);
    res.json(200);
  }catch(e){
    res.json(500, {error: e});
  }
});



/* Document DB */
var saveSheetDB = function(size_top, size_bottom){
  var date = new Date();
  var mon = date.getMonth()+ 1;
  var monstr =''+(mon<=9 ? '0'+mon : mon);
  var fdt = ''+date.getFullYear() + monstr + date.getDate();
  sheetDB.create({
      size_top: size_top,
      size_bottom: size_bottom,
      time: date.getTime(),
      date_index: fdt
    }).catch(console.log);
}

/* Web Socket */
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
      posMix.pushTop(data.len,   saveSheetDB);
    else
      posMix.pushBottom(data.len,saveSheetDB);
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


