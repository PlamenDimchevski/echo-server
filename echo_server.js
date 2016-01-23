var WebSocketServer = require('ws').Server;
var colors  = require( './libs/colors' ) ;                                // Array with all posiible background colors

function EchoServer ( options ) {
   this.history = [];                                                     // Array with all entered characters
   this.wss     = new WebSocketServer( options );                         // Initialize WebSocket.Server
   
   this.full_message = '';                                                // Store the full message string
   this.last_10secs  = '';                                                // Store the last ten minutes message string
   
   this.wss.on( 'connection', this.initConnection.bind( this ) );
}

EchoServer.prototype = {
   initConnection : function ( ws ) {
      var data = {
         string : this.full_message,
         cmd    : null
      };
      
      // Send the current string on every new connection
      if ( this.history.length ) {
         ws.send( JSON.stringify( data ) );
      }
      
      ws.on( 'message', this.onMessage.bind( this ) );
   },
   
   onMessage : function ( message ) {
      this.history.push({
         timestamp : Date.now(),
         char      : message
      });
      
      this.full_message = this.generateMessage();
      this.getLast10Secs();
      
      var data = {
         string : this.full_message,
         cmd    : {
            background : this.checkColor()
         }
      };
      
      // Broadcast the message to all connected to the WebSocket clients
      this.wss.clients.forEach( function ( client ) {
         client.send( JSON.stringify( data ) );
      });
   },
   
   generateMessage : function ( array ) {
      array = array || this.history;
      return array.map( message => message.char ).join('');    // ES6 style yeah
   },
   
   getLast10Secs : function () {
      // Get only the characters that has been enetered in the last 10 seconds
      // and generate string from them
      this.last_10secs = this.generateMessage(
            this.history.filter(
                  elem => ( elem.timestamp >= Date.now() - 10000 )
            )
      );
   },
   
   checkColor : function () {
      for ( var i = 0; i < colors.length; i++ ) {
         if ( this.last_10secs.endsWith( colors[ i ].toLowerCase() ) ) {
            return colors[ i ];
         }
      }
   }
};

module.exports = EchoServer;