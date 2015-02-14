'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var server = require('http').createServer(app);
var photoDB = require('./photo_data/index')
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

// すべてのデータを取得
app.get('/api/photos', function (req, res) {
  photoDB.find({})
  .then(function(photos){
    var retData =[];
    photos.forEach(function(v){
      retData.push({usr: v.name ,img: v.img})
    });
    res.json({"photo_data": retData});
  });
});

// 自分のデータを取得
app.get('/api/myphotos/:uname', function (req, res) {
  photoDB.find({name: req.params.uname})
  .then(function(photos){
    var retData =[];
    photos.forEach(function(v){
      retData.push({usr: v.name ,img: v.img})
    });
    res.json({"photo_data": retData});
  });
});

// 写真投稿
app.post('/api/photos', function(req, res){
  var data = req.body;
  console.log('img size:', data.img.length)
  photoDB.create({
      name: data.usr,
      img: data.img
    }).catch(console.log);
  res.json(200)
})


/*******/
exports = module.exports = app;
/*******/


