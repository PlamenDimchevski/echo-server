var WebSocketServer = require('ws').Server;

function EchoServer ( options ) {
   this.history = [];                                                     // Array with all entered characters
   this.colors  = [ 'white', 'red', 'grey', 'blue', 'pink', 'green' ];    // Array with all posiible background colors
   this.wss     = new WebSocketServer( options );                         // Initialize WebSocket.Server
   
   this.full_message = '';                                                // Store the full message string
   this.last_10mins  = '';                                                // Store the last ten minutes message string
   
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
      this.getLast10Mins();
      
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
   
   generateMessage : function () {
      return this.history.map( message => message.char ).join('');    // ES6 style yeah
   },
   
   getLast10Mins : function () {
      this.last_10mins = this.generateMessage(
            this.history.filter(
                  elem => ( elem.timestamp >= Date.now() - 600000 )
            )
      );
   },
   
   checkColor : function () {
      for ( var i = 0; i < this.colors.length; i++ ) {
         if ( this.last_10mins.endsWith( this.colors[ i ] ) ) {
            return this.colors[ i ];
         }
      }
   }
};

module.exports = EchoServer;