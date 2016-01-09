(function () {
   
   function EchoServer ( ws_location ) {
      
      /*------------- DOM Elements references --------------------------------*/
      this.input  = document.getElementsByName( 'input' )[0];
      this.output = document.getElementsByName( 'output' )[0];
      this.status = document.querySelector( 'div.status' );
      
      this.ws_location = ws_location;               // WebSocket server address
      this.connection  = null;                      // WebSocket.Client instance
      this.interval    = null;
      this.period      = 3000;
      
      this.callbacks   = {
         sendToServer : this.sendToServer.bind( this ),
         onOpen       : this.onOpen.bind( this ),
         onMessage    : this.onMessage.bind( this ),
         onClose      : this.onClose.bind( this )
      };
   };
   
   EchoServer.prototype = {
      
      init : function () {
         // Open WebSocket connection
         this.connection = new WebSocket( this.ws_location );
         clearInterval( this.interval );
         
         // Add WebSocket event listeners
         this.connection.addEventListener( 'open', this.callbacks.onOpen );
         this.connection.addEventListener( 'message', this.callbacks.onMessage );
         this.connection.addEventListener( 'close', this.callbacks.onClose );
      },
      
      onOpen : function () {
         this.status.innerText = 'Connected';
         this.status.classList.remove( 'disconnected' );
         this.status.classList.add( 'connected' );
         this.input.addEventListener( 'keypress', this.callbacks.sendToServer );
      },
      
      onMessage : function ( message ) {
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
      },
      
      onClose : function ( connection ) {
         this.status.innerText = 'Disconnected';
         this.status.classList.remove( 'connected' );
         this.status.classList.add( 'disconnected' );
         this.input.removeEventListener( 'keypress', this.callbacks.sendToServer );
         
         // Try to reconnect
         this.interval = setInterval( this.init.bind( this ), this.period );
      },
      
      sendToServer : function ( event ) {
         // Send to the WebSocket server the entered character
         this.connection.send( String.fromCharCode( event.keyCode ) );
         this.input.value = '';
      }
   };
   
   window.EchoServer = new EchoServer( 'ws://127.0.0.1:1337' );
   
})();