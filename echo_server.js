var WebSocketServer = require('ws').Server;

function EchoServer ( options ) {
   // Array with all entered characters
   this.history = [];
   this.colors = [ 'white', 'red', 'grey', 'blue', 'pink', 'green' ];
   // Initialize WebSocket.Server
   this.wss = new WebSocketServer( options );

   this.wss.on( 'connection', this.initConnection.bind( this ) );
}

EchoServer.prototype = {
   initConnection : function ( ws ) {
      var data = {
         string : this.generateMessage(),
         cmd    : null
      };
      
      // Send the current string on every new connection
      if ( this.history.length ) {
         ws.send( JSON.stringify( data ) );
      }
      
      ws.on( 'message', function ( message ) {
         this.history.push({
            timestamp : Date.now(),
            char      : message
         });
         
         var last = this.getLastTenMinutes();
         var color = this.checkString( last );
         
         data.cmd = {
            background : color
         };
         
         data.string = this.generateMessage();
         
         this.wss.clients.forEach( function ( client ) {
            client.send( JSON.stringify( data ) );
         });
      }.bind( this ));
   },
   
   generateMessage : function () {
      return this.history.map( message => message.char ).join('');         // ES6 style :)
   },
   
   getLastTenMinutes : function () {
      return this.generateMessage(
            this.history.filter(
                  elem => ( elem.timestamp >= Date.now() - 600000 )
            )
      );
   },
   
   checkString : function ( string ) {
      for ( var i = 0; i < this.colors.length; i++ ) {
         if ( string.endsWith( this.colors[ i ] ) ) {
            return this.colors[ i ];
         }
      }
   }
};

module.exports = EchoServer;