var express = require('express');
var app = express();
var WebSocketServer = require('ws').Server;

// Array with all entered characters
var history = [];
var matches = [ 'white', 'red', 'grey', 'blue', 'pink' ];

app.use( express.static( __dirname + '/public' ) );

var server = app.listen( 1337, function () {
   console.log( 'A HTTP Server is started!' );
});

var wss = new WebSocketServer({
   server : server
});

wss.on( 'connection', function ( ws ) {
   
   var data = {
      string : generateMessage( history ),
      cmd    : null
   };
   
   // Send the current string on every new connection
   if ( history.length ) {
      ws.send( JSON.stringify( data ) );
   }
   
   ws.on( 'message', function ( message ) {
      history.push({
         timestamp : Date.now(),
         char      : message
      });
      
      // Make check for 'red', 'white' ...
      var last = getLastTenMinutes( history );
      var color = checkString( last );
      
      data.cmd = {
         background : color
      };
      
      data.string = generateMessage( history );
      
      wss.clients.forEach( function ( client ) {
         client.send( JSON.stringify( data ) );
      });
   });
});

function generateMessage ( array ) {
   return array.map( message => message.char ).join('');         // ES6 style :)
}

function getLastTenMinutes ( array ) {
   return generateMessage( array.filter( function ( elem ) {
      return elem.timestamp >= Date.now() - 600000;
   }));
}

function checkString ( string ) {
   for ( var i = 0; i < matches.length; i++ ) {
      if ( string.endsWith( matches[ i ] ) ) {
         return matches[ i ];
      }
   }
}