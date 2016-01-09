var express = require('express');
var app = express();
var WebSocketServer = require('ws').Server;

// String with all entered characters
var string = '';

app.use( express.static( __dirname + '/public' ) );

var server = app.listen( 1337, function () {
   console.log( 'A HTTP Server is started!' );
});

var wss = new WebSocketServer({
   server : server
});

wss.on( 'connection', function ( ws ) {
   
   var data = {
      string : string,
      cmd    : {
         background : 'grey'
      }
   };
   
   // Send the current string on every new connection
   if ( string.length ) {
      ws.send( JSON.stringify( data ) );
   }
   
   ws.on( 'message', function ( message ) {
      string += message;
      
      // Make check for 'red', 'white' ...
      
      data.string = string;
      
      wss.clients.forEach( function ( client ) {
         client.send( JSON.stringify( data ) );
      });
   });
});