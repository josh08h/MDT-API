var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');
var mysql = require('mysql');
var cors = require('cors');
var app = express();


mongoose.connect(config.database, function(err){
  if(err){
    console.log(err);
  }else{
    console.log('Connected to the database');
  }
});

app.use(cors());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));


app.use(express.static(__dirname + '/public'))

var api = require('./app/routes/api')(app, express);

app.use('/api', api);

app.get('*', function(req, res){
  res.sendFile(__dirname + '/public/views/index.html');
});

app.listen(config.port, function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Listening on port 8000");
  }
})