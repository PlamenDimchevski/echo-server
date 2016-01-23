window.EchoConnection = (function () {
   
   function EchoConnection ( ws_location ) {
      
      /*------------- DOM Elements references --------------------------------*/
      this.container = document.getElementById( 'main-container');
      this.input     = document.getElementById( 'input' );
      this.output    = document.getElementById( 'output' );
      this.status    = document.getElementById( 'status' );
      this.alert_box = document.getElementById( 'alert-box' );
      
      this.ws_location = ws_location || 'ws://127.0.0.1:1337';     // WebSocket server address
      this.connection  = null;                                     // WebSocket.Client instance
      this.interval    = null;                                     // The value of setInterval
      this.period      = 3000;                                     // The time on which the client would try to connect
                                                                   // to the server when the connection is down
      
      this.callbacks   = {
         open            : open.bind( this ),
         close           : close.bind( this ),
         receiveMessage  : receiveMessage.bind( this ),
         sendMessage     : sendMessage.bind( this ),
         closeConnection : closeConnection.bind( this )
      };
      
      init.call( this );
   };
   
   function init () {
      // Check if the browser supports WebSockets
      if ( ! 'WebSocket' in window ) {
         this.alert_box.style.display = 'block';
         this.alert_box.innerHTML = "Your browser doesn't support WebSockets. Please try to open this page with a newer browser."
         return;
      }
      
      this.container.style.display = 'block';
      
      // Open WebSocket connection
      this.connection = new WebSocket( this.ws_location );
      clearInterval( this.interval );
      
      initEvents.call( this );
   }
   
   function initEvents () {
      // Add WebSocket event listeners
      this.connection.addEventListener( 'open', this.callbacks.open );
      this.connection.addEventListener( 'close', this.callbacks.close );
      this.connection.addEventListener( 'message', this.callbacks.receiveMessage );
      
      // Close the WebSocket connection on window unload because Firefox
      // https://bugzilla.mozilla.org/show_bug.cgi?id=712329
      window.addEventListener( 'beforeunload', this.callbacks.closeConnection );
   }
   
   // Executes when we are connected successfully to the server
   function open () {
      resetFields.call( this );
      
      this.status.innerHTML = 'Connected';
      this.status.classList.remove( 'disconnected' );
      this.status.classList.add( 'connected' );
      this.input.addEventListener( 'keypress', this.callbacks.sendMessage );
      
      // Enable the input field
      this.input.disabled = false;
      this.input.focus();
   }
   
   // Handles 'close' event of the WebSocket
   function close ( connection ) {
      this.status.innerHTML = 'Disconnected';
      this.status.classList.remove( 'connected' );
      this.status.classList.add( 'disconnected' );
      this.input.removeEventListener( 'keypress', this.callbacks.sendMessage );
      window.removeEventListener( 'beforeunload', this.callbacks.closeConnection );
      
      // Disable the input field
      this.input.disabled = true;
      
      // Try to reconnect
      this.interval = setInterval( init.bind( this ), this.period );
   }
   
   // Executes on every new message received from the server
   function receiveMessage ( message ) {
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
   }
   
   // Send message to the WebSocket server
   function sendMessage ( event ) {
      // Use `charCode` property to get the character code (because Firefox)
      var code = event.charCode || event.keyCode;
      
      // Send to the WebSocket server the entered character
      this.connection.send( String.fromCharCode( code ) );
      this.input.value = '';
   }
   
   // Clear the values of the input and output text fields
   function resetFields () {
      this.input.value = '';
      this.output.value = '';
   }
   
   // Manually close the WebSocket connection
   function closeConnection () {
      this.connection.close();
   }
   
   EchoConnection.prototype = {};
   
   return EchoConnection;
   
})();