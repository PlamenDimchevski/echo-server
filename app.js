var express = require('express');
var app = express();
var EchoServer = require('./echo_server.js');

app.use( express.static( __dirname + '/public' ) );

var server = app.listen( 1337, function () {
   var host = server.address().address === '' ? server.address().address : '127.0.0.1';
   var port = server.address().port;
   
   console.log( 'HTTP Server is started at http://' + host + ':' + port );
   
   new EchoServer({
      server : server
   });
});