(function(){
   
   function EchoServer ( ws_location ) {
      this.input = document.getElementsByName( 'input' )[0];
      this.output = document.getElementsByName( 'output' )[0];
      this.status = document.querySelector( 'div.status' );
      
      this.connection = null;
      this.ws_location = ws_location;           // WebSocket server address
      this.interval;
      this.period = 3000;
      
      this.callbacks = {
         sendToServer : this.sendToServer.bind( this )
      };
   };
   
   EchoServer.prototype = {
      
      init : function () {
         this.connection = new WebSocket( this.ws_location );
         clearInterval( this.interval );
         
         this.connection.addEventListener( 'open', function () {
            this.status.innerText = 'Connected';
            this.status.classList.remove( 'disconnected' );
            this.status.classList.add( 'connected' );
            this.input.addEventListener( 'keypress', this.callbacks.sendToServer );
         }.bind( this ));
         
         this.connection.addEventListener( 'message', function ( message ) {
            // Parse the received 'message' object
            message = JSON.parse( message.data );
            
            // Resize the output input field if the message is bigger than it
            if ( this.output.size <= message.string.length ) {
               this.output.size = message.string.length;
            }
            
            this.output.value = message.string;
            
            if ( message.cmd ) {
               document.body.style.background   = message.cmd.background;
            }
         }.bind( this ));
         
         // Add listener for WebSocket exit
         this.connection.addEventListener( 'close', function ( connection ) {
            this.status.innerText = 'Disconnected';
            this.status.classList.remove( 'connected' );
            this.status.classList.add( 'disconnected' );
            
            this.input.removeEventListener( 'keypress', this.callbacks.sendToServer );
            
            // Try to reconnect
            this.interval = setInterval( function () {
               this.init( connection.target.url );
            }.bind( this ), this.period );
         }.bind( this ));
      },
      
      sendToServer : function ( event ) {
         // Send to the WebSocket server the entered character
         this.connection.send( String.fromCharCode( event.keyCode ) );
         this.input.value = '';
      }
   };
   
   window.EchoServer = new EchoServer( 'ws://127.0.0.1:1337' );
   
})();