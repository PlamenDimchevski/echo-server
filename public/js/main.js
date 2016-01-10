(function () {
   
   function EchoConnection () {
      /*------------- DOM Elements references --------------------------------*/
      this.input  = document.getElementsByName( 'input' )[0];
      this.output = document.getElementsByName( 'output' )[0];
      this.status = document.querySelector( 'div.status' );
      
      this.ws_location = 'ws://127.0.0.1:1337';     // WebSocket server address
      this.connection  = null;                      // WebSocket.Client instance
      this.interval    = null;                      // The value of setInterval
      this.period      = 3000;                      // The time on which the client would try to connect
                                                    // to the server when the connection is down
      
      this.callbacks   = {
         onOpen          : this.onOpen.bind( this ),
         onMessage       : this.onMessage.bind( this ),
         onClose         : this.onClose.bind( this ),
         sendToServer    : this.sendToServer.bind( this ),
         closeConnection : this.closeConnection.bind( this )
      };
   };
   
   EchoConnection.prototype = {
      init : function () {
         // Open WebSocket connection
         this.connection = new WebSocket( this.ws_location );
         clearInterval( this.interval );
         
         this.initCallbacks();
      },
      
      initCallbacks : function () {
         // Add WebSocket event listeners
         this.connection.addEventListener( 'open', this.callbacks.onOpen );
         this.connection.addEventListener( 'message', this.callbacks.onMessage );
         this.connection.addEventListener( 'close', this.callbacks.onClose );
         
         // Close the WebSocket connection on window unload because Firefox
         // https://bugzilla.mozilla.org/show_bug.cgi?id=712329
         window.addEventListener( 'beforeunload', this.callbacks.closeConnection );
      },
      
      // Executes when we are connected successfully to the server
      onOpen : function () {
         this.resetFields();
         
         this.status.innerHTML = 'Connected';
         this.status.classList.remove( 'disconnected' );
         this.status.classList.add( 'connected' );
         this.input.addEventListener( 'keypress', this.callbacks.sendToServer );
         
         // Enable the input field
         this.input.disabled = false;
         this.input.focus();
      },
      
      // Executes on every new message received from the server
      onMessage : function ( message ) {
         // Parse the received 'message' object
         message = JSON.parse( message.data );
         
         // Resize the output input field if the message is bigger than it
         if ( this.output.size <= message.string.length ) {
            this.output.size = message.string.length;
         }
         
         // Set the message as output field value
         // Parse the value `toString` because Safari
         this.output.value = message.string.toString();
         
         // Check for a received command
         if ( message.cmd ) {
            document.body.style.background   = message.cmd.background;
         }
      },
      
      // Handles 'close' event of the WebSocket
      onClose : function ( connection ) {
         this.status.innerHTML = 'Disconnected';
         this.status.classList.remove( 'connected' );
         this.status.classList.add( 'disconnected' );
         this.input.removeEventListener( 'keypress', this.callbacks.sendToServer );
         
         // Disable the input field
         this.input.disabled = true;
         
         // Try to reconnect
         this.interval = setInterval( this.init.bind( this ), this.period );
      },
      
      // Send message to the WebSocket server
      sendToServer : function ( event ) {
         // Use `charCode` property to get the character code (because Firefox)
         var code = event.charCode || event.keyCode;
         
         // Send to the WebSocket server the entered character
         this.connection.send( String.fromCharCode( code ) );
         this.input.value = '';
      },
      
      // Clear the values of the input and output text fields
      resetFields : function () {
         this.input.value = '';
         this.output.value = '';
      },
      
      closeConnection : function () {
         this.connection.close();
      }
   };
   
   window.EchoConnection = new EchoConnection();
})();